/**
 * Created by zezhi on 2015/12/4.
 */
var express = require('express');
var router = express.Router();
var method = require("../mongoose/index");
var passport= require("passport");
var Strategy = require("passport-http-bearer").Strategy;
var request = require('request');


router.get("/v1/*",passport.authenticate('bearer', { session: false }),function(req,res,next){
    if(req.user.admin){
        return next()
    }
    else{
        res.send(404)
    }
});


router.get("/v1/:collection",passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = method.method[req.params.collection].getData();
    data.then(function (cb) {
        res.json(cb)
    })
});
router.get("/v1/:collection/:_id",passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = method.method[req.params.collection].getOne(req.params._id);
    data.then(function (cb) {
        res.json(cb)
    })
});
router.post("/v1/:collection",passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = new method.method[req.params.collection](req.body);
    data.save(function (err) {
        console.log(err);
        res.json(err)
    })
});
router.put("/v1/:collection/:_id", passport.authenticate('bearer', { session: false }),function (req, res) {
    var data = method.method[req.params.collection].findByIdAndUpdate(req.params._id, req.body).exec(function (err, cb) {
        console.log(err, cb)
    });
    data.then(function (cb) {
        console.log(cb)
        res.json(cb)
    })
});
router.delete("/v1/:collection/:_id",passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = method.method[req.params.collection].findByIdAndRemove(req.params._id).exec();
    data.then(function (cb) {
        res.json(cb)
    })
});

module.exports = router;
