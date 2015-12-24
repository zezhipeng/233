var mongoose = require("mongoose");
var channelSchema = mongoose.Schema({
    parent:{type:mongoose.Schema.ObjectId,ref:"user"},
    uid:{type:Number,default:Date.now},
    title:String,
    alert:String,
    poster:String,
    like:{type:Number,default:0},
    public:{type:String,default:"公开"},
    state:{type:String,default:"未开播"},
    createTime:{type:Date,default:Date.now},
    group:String,
    sign:{type:String,default:"不需要"},
    viewers:{type:Number,default:0},
    charge:{type:String,default:"免费"},
    pay:[
        {user:{type:mongoose.Schema.ObjectId,ref:"user"}
        }
    ],
    cost:Number,
    index:{type:Boolean,default:false}
});
channelSchema.static("getData",function(cb){
    return this.find().populate("parent").exec(cb)
});
channelSchema.static("getOne",function(_id,cb){
    return this.findById(_id).populate("parent").exec(cb)
});
channelSchema.static("search",function(find,filter,option,cb){
    return this.find(find,filter,option).populate({path:"parent",select:"name face uid _id channels videos"}).exec(cb)
})
var channel = mongoose.model("channel",channelSchema);

module.exports = channel;