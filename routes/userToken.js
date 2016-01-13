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
var _ = require("underscore");
router.get("*", passport.authenticate('bearer', {session: false}), function (req, res, next) {
    if (req.user._id) {
        return next()
    }
    else {
        res.send(404)
    }
});

//这里通过passport传进来req.user
//为app.js里面查询到的相关用户信息

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
router.get("/channels", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.channels
        .findOne({parent: req.user._id})
        .exec(function (err, cb) {
            res.json({err: err, cb: cb})
        })
});
//创建频道
router.post("/channels", passport.authenticate('bearer', {session: false}), function (req, res) {
    if (req.user.identify == "允许直播") {//首先判断用户是否有权限创建一个新的频道
        new method.channels(req.body)
            .save(function (err, cb) {
                if (!err) {
                    method.users
                        .findByIdAndUpdate(req.user._id)
                        .exec(function (err, callback) {
                            res.json({err: err, cb: cb})
                        })
                }

            })
    }
    else {
        res.json({err: "用户没有权限", cb: null})
    }
});
//更新频道
router.put("/channels", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.channels
        .findOneAndUpdate({parent: req.user._id}, req.body)
        .exec(function (err, cb) {
            method.channels
                .findOne({parent: req.user._id})
                .exec(function (err, cb) {
                    res.json({err: err, cb: cb})
                })
        })
});
//删除频道
router.delete("/channels", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.channels
        .findOneAndRemove({parent: req.user._id})//从channels集合中删除
        .exec(function (err, cb) {
            console.log(err, cb)
            if (!err) {
                method.users
                    .findByIdAndUpdate(req.user._id, {$unset: {channels: req.user.channels}})//从用户集合中删除
                    .exec(function (err, cb) {
                        res.json({err: err, cb: cb})
                    })
            }
            else {
                res.json({err: "频道不存在", cb: null})
            }
        })
});
//上传视频
router.post("/uploadVideo", passport.authenticate('bearer', {session: false}), function (req, res) {
    var video = req.files;
    console.log(video)
    var appPath = process.cwd();//这个文件路径
    var _path = appPath + "/public/video/" + video.file.name;//保存的视频文件路径
    video.size = filesize(video.size).human('jedec');//文件大小格式化
    fs.rename(video.file.path, _path, function (err) {//上传视频后截图
        ffmpeg(_path)
            .screenshots({
                timestamps: ['50%'],//视频50%处截图
                filename: video.file.name + '.jpg',
                folder: appPath + "/public/video",
                size: '640x380'//图片分辨率
            })
            .on('end', function () {
                //文件名，以后用前端md5计算后上传，可以确定文件的唯一性，可以实现秒传等功能
                video.file.fileName = video.file.name;
                //视频截图地址
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
        .findByIdAndUpdate(req.params._id, video)
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
//删除视频
router.delete("/videos/:_id", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.channels
        .findOneAndRemove({_id: req.params._id})
        .exec(function (err, cb) {
            if (!err) {
                method.users
                    .findByIdAndUpdate(req.user._id, {$unset: {videos: req.params._id}})
                    .exec(function (err, cb) {
                        res.json({err: err, cb: cb})
                    })
            }
            else {
                res.json({err: "未找到该视频", cb: null})
            }
        })
});

//发送消息
router.post("/messages/:_id", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.users
        .findByIdAndUpdate(req.params._id, {$push: {messages: {user: req.user._id, msg: req.body.msg}}})
        .exec(function (err, cb) {
            res.json({err: err})
        })
});

//查询消息
router.get("/messages", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.users
        .findById(req.user._id)
        .populate({path: "messages.user", select: "name _id face uid channels videos"})
        .exec(function (err, cb) {
            if (cb) {
                res.json(cb.messages)
            }
        })
});

//查询对应的历史对话
router.get("/messages/:_id", passport.authenticate('bearer', {session: false}), function (req, res) {
    method.users
        .findOneAndUpdate({"messages._id": req.params._id}, {$set: {"messages.$.unRead": false}})//更新为已读信息
        .populate({path: "messages.user", select: "name face _id uid Email channels videos"})
        .exec()
        .then(function(cb){//查询这个此条信息
            if (cb&&cb.messages) {
                var message = _.find(cb.messages, function (v) {
                    return v._id == req.params._id
                })
                return message//把查询结果传到下个then
            }
            else{
                res.json(null)
            }
        })
        .then(function(cb){//根据上面查询到的信息，查询两个人的对话
            method.users
                .find({"messages.user":{$in:[req.user._id,cb.user._id]}})
                .select("messages")
                .populate({path: "messages.user", select: "name face _id uid Email channels videos"})
                .exec()
                .then(function(callback){
                    var messages =_.union(callback[0].messages,callback[1].messages)//合并查询结果
                    messages = _.sortBy(_.filter(messages,function(v){//根据时间排序
                        return v.user.name==req.user.name||v.user.name==cb.user.name
                    }),function(msg){
                        return msg.time
                    })
                    res.json(messages)
                })
        })

})
module.exports = router;

