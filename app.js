var http = require('http');
var express = require('express');
var routes = require('./routes');
var users = require('./routes/users');
var api = require("./routes/api");
var token = require("./routes/token");
var userToken = require("./routes/userToken");
var path = require('path');
var favicon = require('serve-favicon');//图标中间件
var logger = require('morgan');//日志中间件
var methodOverride = require('method-override');
var session = require('express-session');//session中间件
var passport = require("passport"); //passport依赖,用于token
var Strategy = require("passport-http-bearer").Strategy; //token依赖
var fs= require("fs")
var accessLogStream = fs.createWriteStream(__dirname+"/public/log/"+parseInt(Date.now()/1000/3600/24)+".log")//定时保存日志
var bodyParser = require('body-parser');
var multer = require('multer');//上传文件中间件
var errorHandler = require('errorhandler');
var config = require("./config");  //主要的配置文件中间件
var mongoose = require("mongoose");
var mongoStore = require("connect-mongo")(session);//mongodb session中间件
mongoose.connect(config.dbUrl);
var method = require("./mongoose/index.js");
var ws = require("./socket");
var db = mongoose.connection;
var nodemailer = require('nodemailer');

//连接数据库成功后响应
db.once("open", function () {
    console.log("db connect")
});
//session关于mongodb的配置,session时效7天
var store = new mongoStore({
    mongooseConnection: db,
    ttl: 7 * 24 * 60 * 60
});

//seesion配置
var _session = session({
    resave: true,
    saveUninitialized: true,
    secret: 'uwotm8',
    store: store
});

var app = express();
// view engine setup
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(favicon(__dirname + '/public/favicon.ico'));

//一堆中间件
app.use(logger('dev'));
app.use(methodOverride());
app.use(logger(':remote-addr :date[web] :url',{stream: accessLogStream}));
app.use(methodOverride());
app.use(_session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: 'uploads/'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(passport.initialize());
app.use(passport.session());



config.middleware(app);

//token中间件的配置
passport.use(new Strategy(
    function(token, cb) {
        method.method.token
            .findOne({token:token})
            .populate({path:"user",
                     select:"_id name uid Email phone face follows fans regTime lv channels admin videos weibo address IdCard bank identify ipCamera messages"
            })
            .exec(function(err, user) {
            //console.log(err,user);
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user.user);
        })
    }));

app.use('/', routes);
app.use('/users', users);
app.use("/api", api);
app.use("/token",token);
app.use("/userToken",userToken)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {

        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = http.createServer(app);

//socket监听
ws.listen(server);


server.listen(config.port, function () {
    console.log("server started")
});
