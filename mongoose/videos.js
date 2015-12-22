/**
 * Created by Administrator on 2015/10/28.
 */
var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var videoSchema = mongoose.Schema({
    parent:{type:mongoose.Schema.ObjectId,ref:"user"},
    name:String,
    fileName:String,
    detail:{type:String,default:""},
    uid:{type:Number,default:Date.now()},
    title:String,
    poster:String,
    createTime:{type:Date,default:Date.now()},
    like:{type:Number,default:0},
    public:{type:String,default:"公开"},
    charge:{type:String,default:"免费"},
    group:String,
    sign:{type:String,default:"不需要"},
    size:String,
    views:{type:Number,default:0},
    pay:[
        {user:{type:mongoose.Schema.ObjectId,ref:"user"},
               cost:Number
        }
    ],
    comments:[{msg:String,
                user:{type:mongoose.Schema.ObjectId,ref:"user"},
                time:{type:Date,default:Date.now()}
    }]
});
videoSchema.static("getData",function(cb){
    return this.find().populate("parent").exec(cb)
});
videoSchema.static("getOne",function(_id,cb){
    return this.findById(_id).populate("parent").exec(cb)
});
videoSchema.static("gen",function(_id,cb){
    console.log(_id)
    return this.find({parent:_id}).populate({path:"user",select:"name face uid"}).exec(cb)
});
videoSchema.plugin(deepPopulate,{populate:{"comments.user":{select:"name face"}}});

var video = mongoose.model("video",videoSchema);

module.exports = video;