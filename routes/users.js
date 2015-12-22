var express = require('express');
var router = express.Router();
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');
var filesize = require('file-size');
var md5 = require("blueimp-md5").md5;
var method = require("../mongoose/index");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/admin/addChannel",function(req,res){
  if(req.session.user.identify=="允许直播"){
      res.render("addChannel",
          { auth:req.session.auth ,
              user:req.session.user})
  }
  else{
      res.send(404)
  }
});
router.get("/admin/uploadVideo",function(req,res){
   res.render("uploadVideo",{
       auth:req.session.auth ,
       user:req.session.user
   })
});
//获取本人信息
router.get("/account",function(req,res){
   method.method.users.findById(req.session.user._id).populate({path:"fans follows",select:"name face _id regTime uid" }).populate("channels videos").exec(function(err,cb){
       res.json(cb)
   })
});
router.put("/account",function(req,res){
    console.log(req.body);
    req.body.face = req.session.user.face;
    method.method.users.findByIdAndUpdate(req.session.user._id,req.body).exec(function(err,cb){
        console.log(cb);
        res.json(err)
    })
});


router.post("/uploadPoster",function(req,res){
  var file = req.files;
  console.log(file);
  var appPath = process.cwd();
  var path = appPath+"/public/admin/"+req.session.user.name+"/"+file.file.name+".jpg";
  ffmpeg()
        .input(file.file.path)
        .output(path)
        .size("640x380")
        .on('end', function() {
            console.log('Screenshots taken');
            res.send("/admin/"+req.session.user.name+"/"+file.file.name+".jpg")
        })
        .on("error",function(err){
            console.log(err)
        })
        .run();
});

//user api
router.post("/channel",function(req,res){
    var channel = req.body;
    channel.parent = req.session.user._id;
    var _channel = new method.method.channels(channel);
    console.log(_channel);
    _channel.save(function(err,cb){
        if(!err){
            method.method.users.findByIdAndUpdate(req.session.user._id,{channels:_channel._id}).exec()
        }
        res.json(err)
    })
});

//上传视频
router.post("/uploadVideo",function(req,res){
    var video = req.files;
    console.log("111",video);
    var appPath = process.cwd();
    console.log(appPath);
    var _path = appPath+"/public/video/"+video.file.name;
    req.session.videoFileName = video.file.name;
    console.log(_path);
    fs.rename(video.file.path,_path,function(err){
        console.log(err);
        req.session.video = video.file;
        ffmpeg(_path)
            .screenshots({
                timestamps: ['50%'],
                filename: video.file.name+'.jpg',
                folder: appPath+"/public/video",
                size: '640x380'
            })
            .on('end', function() {
                console.log('Screenshots taken');
                req.session.video.poster = "/video/"+video.file.name+'.jpg';

                res.send("/video/"+video.file.name+".jpg")
            })
            .on("error",function(err){
                console.log(err)
            });

    });
});
//获取视频
router.get("/video",function(req,res){
    method.method.users.findById(req.session.user._id).populate("videos").exec(function(err,cb){
        res.json(cb)
    })
});
//保存视频
router.post("/video",function(req,res){
    //console.log(req.body);
    var video = req.session.video;
    console.log(video);
    video.title = req.body.title;
    video.parent = req.session.user._id;
    video.group = req.body.group;
    video.public = req.body.public;
    video.size = filesize(video.size).human('jedec');
    video.detail = req.body.detail;
    video.fileName = req.session.videoFileName;
    console.log(video);
    var _video = new method.method.videos(video);
    _video.save(function(err,cb){
        if(!err){
            method.method.users.findByIdAndUpdate(req.session.user._id,{$push:{videos:_video._id}}).exec()
            res.json(err)
        }
    })
});
//删除视频
router.delete("/video/:_id",function(req,res){
    var _id = req.params._id;
    method.method.videos
        .remove({_id:_id})
        .exec(function(err,cb){
            console.log(cb)
            method.method.users.findByIdAndUpdate(req.session.user._id,{$pull:{videos:_id}}).exec(function(err,cb){
                console.log(err);
                res.json(err)
            })
        })


});



//上传头像
router.get("/admin/changeFace",function(req,res){
    res.render("changeFace",{
        auth:req.session.auth ,
        user:req.session.user
    })
});
router.post("/uploadFace",function(req,res){
    var file = req.files;
    console.log(file);
    var appPath = process.cwd();
    var path = appPath+"/public/admin/"+req.session.user.name+"/"+file.file.name+".jpg";
    ffmpeg()
        .input(file.file.path)
        .output(path)
        .size("100x100")
        .on('end', function() {
            console.log('Screenshots taken');
            req.session.user.face="/admin/"+req.session.user.name+"/"+file.file.name+".jpg"
            res.send("/admin/"+req.session.user.name+"/"+file.file.name+".jpg")
        })
        .on("error",function(err){
            console.log(err)
        })
        .run();
});
//保存头像
router.get("/saveFace",function(req,res){
   if(req.session.face){
       method.method.users.findByIdAndUpdate(req.session.user._id,{face:req.session.face}).exec(function(err,cb){
           res.json(err);
               req.session.user.face = req.session.face;
       })
   }
});

//线路添加
router.get("/line",function(req,res){
    res.render("addLine",{
        auth:req.session.auth ,
        user:req.session.user
    })
});
router.post("/addLine",function(req,res){
    var _line= new method.method.lines(req.body)
    console.log(_line)
    _line.save(function(err,cb){
        res.json(err)
    })
});

//评论
router.post("/addComment/:_id",function(req,res){
    var data={
        msg:req.body.msg,
        user:req.session.user._id,
        time:Date.now()
    };
    console.log(data);
    method.method.videos.findByIdAndUpdate(req.params._id,{$push:{comments:data}}).exec(function(err,cb){
        method.method.videos.findById(req.session.videoId).populate({path:"comments.user",select:"name uid face fans follows regTime channels videos weibo"}).select("comments").exec(function(err,cb2){
            res.json(cb2.comments)
        });

    })
});

//密码
router.put("/password",function(req,res){
   var data = req.body;
    data.oldPwd = md5(data.oldPwd,"adinno")
    data.Pwd =md5(data.Pwd,"adinno")
    console.log(data)
    method.method.users.findOne({_id:req.session.user._id,password:data.oldPwd}).exec(function(err,cb){
       if(cb){
           method.method.users.findByIdAndUpdate(req.session.user._id,{password:data.Pwd}).exec(function(err2,cb2){
               console.log(cb2)
               res.json(err2)
           })
       }
       else{
           res.json("密码错误")
       }
   })
});

//加关注
router.put("/addFollow",function(req,res){
    method.method.users.findOne({_id:req.session.user._id,follows:req.session.bc}).exec(function(err,cb) {
        if(!cb){
            method.method.users.findByIdAndUpdate(req.session.user._id,{$push:{follows:req.session.bc}}).exec()
            method.method.users.findByIdAndUpdate(req.session.bc,{$push:{fans:req.session.user._id}}).exec()
        }
        res.json(cb)
    })
});
//我的关注页
router.get("/admin/follows",function(req,res){
    method.method.users.findById(req.session.user._id).populate("follows").exec(function(err,cb){
        method.method.channels.populate(cb,"follows.channels",function(err2,cb){
            res.render("follows",{
                auth:req.session.auth ,
                user:req.session.user,
                follows:cb.follows
            })
        })
    })
});
router.get("/myChannel",function(req,res){
    method.method.users.findById(req.session.user._id).populate("channels").exec(function(err,cb){
        res.json(cb.channels)
    })
});
router.get("/admin/channel",function(req,res){
    if(req.session.user.identify=="允许直播"){
        res.render("channel",{
            auth:req.session.auth ,
            user:req.session.user
        })
    }
    else{
        res.send(404)
    }
})
//频道修改
router.put("/channelSet",function(req,res){
    method.method.channels.findByIdAndUpdate(req.body._id,req.body).exec(function(err,cb){
        console.log(err,cb)
        res.json(err)
    })
})
module.exports = router;
