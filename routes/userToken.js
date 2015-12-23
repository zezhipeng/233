/**
 * Created by zezhi on 2015/12/8.
 */
var express = require('express');
var router = express.Router();
var method = require("../mongoose/index").method;
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');
var filesize = require('file-size');
var md5 = require("blueimp-md5").md5;
var plupload = require('express-plupload').middleware
var passport = require("passport");
var Strategy = require("passport-http-bearer").Strategy;
router.get("*", passport.authenticate('bearer', {session: false}), function (req, res, next) {
    if (req.user._id) {
        return next()
    }
    else {
        res.send(404)
    }
});
//基本信息
router.get("/basic", passport.authenticate('bearer', {session: false}), function (req, res) {
    res.json(req.user)
});
//基本信息更新
router.put("/basic", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.users
        .findByIdAndUpdate(req.user._id, req.body)
        .exec(function (err, cb) {
            method.users
                .findById(req.user._id)
                .exec(function (err, user) {
                    if (err) {
                        throw err
                    }
                    else {
                        res.json({err: err, user: user})
                    }
                })
        })
});

//获取我的频道
router.get("/channels",passport.authenticate('bearer', {session: false}),function(req,res){
    method.channels
        .findOne({parent:req.user._id})
        .exec(function(err,cb){
            res.json({err:err,cb:cb})
        })
});
router.post("/channels",passport.authenticate('bearer', {session: false}),function(req,res){
   if(req.user.identify=="允许直播"){
       new method.channels(req.body)
           .save(function(err,cb){
               if(!err){
                   method.users
                       .findByIdAndUpdate(req.user._id)
                       .exec(function(err,callback){
                           res.json({err:err,cb:cb})
                       })
               }

           })
   }
   else{
       res.json({err:"用户没有权限",cb:null})
   }
});
router.put("/channels",passport.authenticate('bearer', {session: false}),function(req,res){
    method.channels
        .findOneAndUpdate({parent:req.user._id},req.body)
        .exec(function(err,cb){
            method.channels
                .findOne({parent:req.user._id})
                .exec(function(err,cb){
                    res.json({err:err,cb:cb})
                })
        })
});
router.delete("/channels",passport.authenticate('bearer', {session: false}),function(req,res){
    method.channels
        .findOneAndRemove({parent:req.user._id})
        .exec(function(err,cb){
            console.log(err,cb)
            if(!err){
                method.users
                    .findByIdAndUpdate(req.user._id,{$unset:{channels:req.user.channels}})
                    .exec(function(err,cb){
                        res.json({err:err,cb:cb})
                    })
            }
            else{
                res.json({err:"频道不存在",cb:null})
            }
        })
});
//上传视频
router.post("/uploadVideo", passport.authenticate('bearer', {session: false}), function (req, res) {
    var video = req.files;
    console.log(video)
    var appPath = process.cwd();
    var _path = appPath + "/public/video/" + video.file.name;
    video.size = filesize(video.size).human('jedec');
    fs.rename(video.file.path, _path, function (err) {
        ffmpeg(_path)
            .screenshots({
                timestamps: ['50%'],
                filename: video.file.name + '.jpg',
                folder: appPath + "/public/video",
                size: '640x380'
            })
            .on('end', function () {
                video.file.fileName = video.file.name;
                video.file.poster = "/video/" + video.file.name + '.jpg';
                res.send(video.file)
            })
            .on("error", function (err) {
                console.log(err);
                res.send("err")
            });

    });
});
//保存视频
router.post("/videos", passport.authenticate('bearer', {session: false}), function (req, res) {
    var video = req.body;
    video.parent = req.user._id;
    new method.videos(video)
        .save(function (err, cb) {
            res.json({err: err, cb: cb})
        })
});
//修改
router.put("/videos/:_id", passport.authenticate('bearer', {session: false}), function (req, res) {
    var video = req.body;
    video.parent = req.user._id;
    method.videos
        .findByIdAndUpdate(req.params._id,video)
        .exec(function (err, cb) {
            res.json({err: err, cb: cb})
        })
});
//我的视频
router.get("/videos", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.videos.gen(req.user._id)

        .then(function (cb) {
            console.log(cb)
            res.json(cb)
        })
});
router.delete("/videos/:_id",passport.authenticate('bearer', {session: false}),function(req,res){
    method.channels
        .findOneAndRemove({_id:req.params._id})
        .exec(function(err,cb){
            if(!err){
                method.users
                    .findByIdAndUpdate(req.user._id,{$unset:{videos:req.params._id}})
                    .exec(function(err,cb){
                        res.json({err:err,cb:cb})
                    })
            }
            else{
                res.json({err:"未找到该视频",cb:null})
            }
        })
});
router.post("/messages/:_id",function(req,res){
    req.body.user = req.user.name
    method
        .findByIdAndUpdate(req.params._id,{$push:{messages:req.body}})
        .exec(function(err,cb){
            res.json({err:err})
        })
});
router.get("/messages",function(req,res){
    method
        .findByIdAndUpdate(req.user._id,{$set:{unread:false}})
        .exec(function(err,cb){

        })
})
module.exports = router;

