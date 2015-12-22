/**
 * Created by Administrator on 2015/10/9.
 */
var mongoose = require("mongoose");
var token = require("./token");
var userSchema = mongoose.Schema({
    name:{type:String,unique:true},
    uid:Number,
    password:String,
    Email:String,
    phone:String,
    face:{type:String,default:"/images/face.png"},
    follows:[{type:mongoose.Schema.ObjectId,ref:"user"}],
    fans:[{type:mongoose.Schema.ObjectId,ref:"user"}],
    regTime:{type:String,default:Date.now()},
    lv:{type:Number,default:"1"},
    regIp:String,
    channels:{type:mongoose.Schema.ObjectId,ref:"channel"},
    admin:{type:Boolean,default:false},
    videos:[{type:mongoose.Schema.ObjectId,ref:"video"}],
    weibo:String,
    address:String,
    IdCard:Number,
    bank:Number,
    identify:{type:String,default:"没有权限"},
    ipCamera:{type:Boolean,default:false}
});

userSchema.static("getData",function(cb){
    return this.find({}).populate("channels videos").exec(cb)
});
userSchema.static("getOne",function(_id,cb){
    return this.findById(_id).populate("channels videos").exec(cb)
});

var user = mongoose.model("user",userSchema);

module.exports = user;