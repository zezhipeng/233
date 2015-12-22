/**
 * Created by Administrator on 2015/10/29.
 */
var express = require('express');
var router = express.Router();
var method = require("../mongoose/index");
var request = require('request');
var fs = require("fs")
router.get("/superAdmin", function (req, res) {
    res.render("superAdmin", {
        auth: req.session.auth,
        user: req.session.user
    })
});

router.get("/v1/:collection", function (req, res) {
    var data = method.method[req.params.collection].getData();
    data.then(function (cb) {

        res.json(cb)
    })
});
router.get("/v1/:collection/:_id", function (req, res) {
    var data = method.method[req.params.collection].getOne(req.params._id);
    data.then(function (cb) {
        res.json(cb)
    })
});
router.post("/v1/:collection", function (req, res) {
    var data = new method.method[req.params.collection](req.body);
    data.save(function (err) {
        console.log(err);
        res.json(err)
    })
});
router.put("/v1/:collection/:_id", function (req, res) {
    var data = method.method[req.params.collection].findByIdAndUpdate(req.params._id, req.body).exec(function (err, cb) {
        console.log(err, cb)
    });
    data.then(function (cb) {
        console.log(cb)
        res.json(cb)
    })
});
router.delete("/v1/:collection/:_id", function (req, res) {
    var data = method.method[req.params.collection].findByIdAndRemove(req.params._id).exec();
    data.then(function (cb) {
        res.json(cb)
    })
});

router.get("/log",function(req,res){
   var path =  process.cwd()
   var stream=  fs.createReadStream(process.cwd()+"/public/log/"+parseInt(Date.now()/1000/3600/24)+".log");
    var byteSize = 10;
    stream.on("readable", function() {
        var chunk;
        while ( (chunk = stream.read(byteSize)) ) {
            console.log(chunk.length);
        }
    });
    console.log(stream)
    stream.pipe(res)
});

module.exports = router;
