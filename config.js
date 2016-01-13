/**
 * Created by tf on 2015/11/21.
 */
var method = require("./mongoose/index");


var config = {
    port: 80,
    //dbUrl:"mongodb://adinno:123123@localhost/demo",
    dbUrl:"mongodb://localhost/demo",
    middleware: function (app) {
        //域名绑定
        //app.all("/*",function(req,res,next){
        //  if(req.hostname=="www.seei.tv" || req.hostname=="seei.tv"){
        //      console.log(req.hostname)
        //    next()
        //  }
        //  else{
        //    res.render("error",{error:404})
        //  }
        //})
        //保存ip地址
        app.all("/live/*", function (req, res, next) {
            if (req.session.auth && req.session.user._id) {
                _ip = new method.method.ip({ip: req.ip, user: req.session.user._id});
                _ip.save()
            }
            else {
                _ip = new method.method.ip({ip: req.ip});
                _ip.save()
            }
            return next()
        });
        //需要以及登陆
        app.all("/users/*", function (req, res, next) {
            if (req.session.auth) {
                return next()
            }
            else {
                res.render("error")
            }
        });
        //需要管理员权限
        app.all("/api/*", function (req, res, next) {
            if (req.session.auth && req.session.user.admin) {
                return next()
            }
            else {
                res.render("error")
            }
        });
    }
};
module.exports = config;