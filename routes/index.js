var express = require('express');
var router = express.Router();
var method = require("../mongoose/index");
var fs = require("fs");
var md5 = require("blueimp-md5").md5;
var request = require("request");
/* GET home page. */
//var _official =new official({
//  name:"adinno"
//})
//_official.save()

//注册
//登录
//先密码md5，然后查询数据库，进行对比查询,看用户是否存在
//之后生成一个token
router.post("/reg", function (req, res) {
    method.method.official
        .findOneAndUpdate({name: "adinno"}, {$inc: {userCount: 1}})//总用户数+1
        .exec(function (err, cb) {
            req.body.uid = cb.userCount;
            req.body.password = md5(req.body.password, "adinno");//密码md5加密
            var _user = new method.method.users(req.body);//实例化user
            _user
                .save(function (err, cb) {
                    if (err) {
                        res.json({err: err, cb: cb})
                    }
                    else {
                        req.session.user = cb;
                        req.session.auth = true;
                        new method.method.token({user: _user._id})  //生成token
                            .save(function (err, cb) {
                                res.json({err: err, token: cb.token});
                                console.log(cb)
                            })
                    }

                })
        })
});

//登录
//先密码md5，然后查询数据库，进行对比查询,
//之后查询这个用户是否有token，没有的话就生成一个
router.post("/sign", function (req, res) {
    //console.log(req.body);
    req.body.password = md5(req.body.password, "adinno");//密码md5加密
    method.method.users
        .findOne(req.body)
        .exec(function (err, cb) {
            if (cb) {
                req.session.auth = true;
                req.session.user = cb;
                method.method.token//查询token，有的话就响应，没有的话就生成一个
                    .findOne({user: cb._id})
                    .exec(function (err, callback) {
                        if (callback) {
                            res.json({err: err, token: callback.token})
                        }
                        else {
                            new method.method.token({user: cb._id})//生成token
                                .save(function (err, cb) {
                                    res.json({err: err, token: cb.token});
                                })
                        }
                    })
            }
            else {
                res.json({err: "用户名或密码错误", token: null})
            }
        })
});
//注销
router.get("/signOut", function (req, res) {
    req.session.destroy();
    res.redirect("/")
});

//首页
//查询videos和channels
router.get('/', function (req, res, next) {
    var _videos = method.method.videos
        .find({public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face regTime channels videos weibo"
        })
        .limit(5)
        .sort({views: -1})
        .exec();
    var _channels = method.method.channels
        .find({public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .limit(5)
        .sort({viewer: -1})
        .exec();
    method.method.channels
        .find({index: true})
        .sort({viewers: -1}
        ).populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .limit(1)
        .exec()
        .then(function (cb) {
            _videos
                .then(function (videos) {
                    _channels
                        .then(function (channels) {
                            res.render('index',
                                {
                                    title: 'Seei.tv',
                                    auth: req.session.auth,
                                    user: req.session.user,
                                    index: cb[0],
                                    channels: channels,
                                    videos: videos
                                });
                        })
                })
        })
});

//获取video
router.get("/videos", function (req, res) {
    var _videos = method.method.videos
        .find({public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face regTime channels videos weibo"
        })
        .exec();
    _videos
        .then(function (cb) {
            //console.log(cb);
            res.json(cb)
        })
});
//获取video
router.get("/videos/:_id", function (req, res) {
    var _videos = method.method.videos
        .findOne({public: "公开", _id: req.params._id})
        .populate({
            path: "parent",
            select: "name uid face regTime channels videos weibo"
        })
        .deepPopulate("comments.user")
        .exec();
    _videos
        .then(function (cb) {
            console.log("视频已发送")
            res.json(cb)
        })
});
//获取频道
router.get("/channels", function (req, res) {
    var _channels = method.method.channels
        .find({public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .exec();
    _channels
        .then(function (cb) {
            console.log("频道已发送")
            res.json(cb)
        })
});
//获取频道
router.get("/channels/:_id", function (req, res) {
    var _channels = method.method.channels
        .findOne({public: "公开", _id: req.params._id})
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .exec();
    _channels
        .then(function (cb) {
            res.json(cb)
        })
});
//获取用户基本资料
router.get("/user/:userId", function (req, res) {
    var _user = method.method.users
        .findById(req.params.userId)
        .populate("channels")
        .populate("videos")
        .select("name uid face fans follows regTime channels videos weibo")
        .exec();
    _user
        .then(function (cb) {
            //console.log(cb);
            res.json(cb)
        })
});


//频道页面
router.get("/live/:uid", function (req, res) {
    var uid = req.params.uid
    method.method.users
        .findOne({uid: uid})
        .populate("channels videos")
        .exec(function (err, cb) {
            if (cb) {
                //req.session.channelId = cb.channels._id;
                //req.session.bc = cb._id;
                method.method.lines
                    .find({status: "ready"})//返回状态为ready的线路
                    .exec(function (err, lines) {
                        //console.log(cb,lines);
                        res.render("live", {
                                auth: req.session.auth,
                                user: req.session.user,
                                channelId: cb.channels._id,
                                lines: lines,
                                channels: cb.channels,
                                uid: uid,
                                live: cb,
                                videos: cb.videos
                            }
                        )
                    })
            }

        });
});
//直播详情
router.get("/liveDetail/:_id", function (req, res) {
    //直播页面打开后，前端请求获取直播页面的具体信息
    var uid = req.params._id;
    //console.log("uid:=",uid)
    var _user = method.method.users
        .findOne({uid: uid})
        .populate("channels videos")
        .select("name uid face fans follows regTime channels videos weibo channels videos")
        .exec(function (err, cb) {
            //console.log(err,cb)
            res.json(cb)
        });

});
//线路获取
router.get("/lines", function (req, res) {
    method.method.lines
        .find({status: "ready"})
        .exec(function (err, cb) {
            res.json(cb)
        })
})
//测试页
router.get("/test", function (req, res) {
    res.render("test")
});
//获取视频
router.get("/video/:videoId", function (req, res) {
    var videoId = req.params.videoId;
    req.session.videoId = videoId;//session里面保存当前的频道id，为socket里面可以调用当前视频id留的借口
    var _video = method.method.videos
        .findByIdAndUpdate(videoId, {$inc: {views: 1}})//每次点击后观看人数+1
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .exec();
    _video
        .then(function (cb) {
            method.method.lines//查询可用线路
                .find({status: "ready"})
                .exec(function (err, lines) {
                    method.method.videos//查询相关的视频，作为前端的ui，视频列表
                        .find()
                        .populate("parent")
                        .sort({views: -1})
                        .exec(function (err, videos) {
                            res.render("video", {
                                auth: req.session.auth,
                                user: req.session.user,
                                video: cb,
                                lines: lines,
                                videos: videos
                            })
                        })

                })
        })
});
//评论
router.get("/comments/:_id", function (req, res) {
    method.method.videos
        .findById(req.params._id)
        .deepPopulate("comments.user")
        .exec(function (err, cb) {
            res.json(cb.comments)
        })
});
//视频和频道的相关集合列表页面
router.get("/watch/list/:collection/:group", function (req, res) {
    //console.log(method.method[req.params.collection]);
    method.method[req.params.collection]
        .find({group: req.params.group, public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        .sort({viewers: -1, views: -1})
        .exec(function (err, cb) {
            //console.log(cb)
            res.render("list", {
                group: req.params.group,
                collection: req.params.collection,
                auth: req.session.auth,
                user: req.session.user,
                cb: cb
            })
        });
});

//视频和频道的列表页面
router.get("/watch/list/:collection", function (req, res) {
    //查询相关集合中public为公开的数据
    method.method[req.params.collection]
        .find({public: "公开"})
        .populate({
            path: "parent",
            select: "name uid face fans follows regTime channels videos weibo"
        })
        //降序排列
        .sort({viewers: -1, views: -1})
        .exec(function (err, cb) {
            //console.log(cb)
            res.render("all", {
                group: req.params.group,
                collection: req.params.collection,
                auth: req.session.auth,
                user: req.session.user,
                cb: cb
            })
        });
});
router.get("/about", function (req, res) {
    res.render("about")
});

//定位api
router.get("/location", function (req, res) {
    var ip = req.ip.slice(7);

    function requestQ(ip) {
        //利用百度的地位api，根据ip获取地址,promise方法定义
        return new Promise(function (fulfill, reject) {
            request.get("http://api.map.baidu.com/location/ip?ak=4zzMYIt7cBkcgnKgjwR8XwRQ&coor=bd09ll&ip=" + ip, function (err, res, body) {
                if (err) {
                    reject(err)
                }
                else {
                    fulfill(JSON.parse(body))
                }
            })
        })
    }

    requestQ(ip).then(function (cb) {
        //console.log(cb);
        res.json(cb)
    })
});

//ipcamera的api
router.get("/ipCamera", function (req, res) {
    //对ipCamera服务器进行POST请求，把响应的渲染为视图
    request.post({
        url: 'http://zyhh123.eicp.net:9000/GetListUrl.json',
        content: "admin"
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err)
        }
        var cameras = JSON.parse(body)
        res.render("ipCamera", {cameras: cameras})
    })
})
//搜索api的相关函数，主要解析请求把对应的请求的类型进行转换
function options(options) {
    var objeact = {};
    for (type in options) {
        if (type != "find") {
            switch (type) {
                case "limit":
                    objeact[type] = parseInt(options[type]);//转为number
                    break;
                case "skip":
                    objeact[type] = parseInt(options[type]);//转为number
                    break;
                case "sort":
                    console.log(typeof options[type])
                    objeact[type] = options[type]//排序无需转换，直接用string类型
                    break;
                default:break;
            }
        }
    }
    return objeact
}

//search

//相关api设置可查询文档
router.get("/search", function (req, res) {
    var v = options(req.query)
    var find = new RegExp(req.query.find, "i")//转换为正则类型
    method.method[req.query.collection]
        .search({title: find}, null, v)
        .then(function (cb) {
            //console.log(cb)
            res.json(cb)
        })
});
module.exports = router;
