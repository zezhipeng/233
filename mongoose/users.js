/**
 * Created by Administrator on 2015/10/9.
 */
var mongoose = require("mongoose");
var token = require("./token");
var userSchema = mongoose.Schema({
    name:{type:String,unique:true,required:true},//用户名，唯一，必填
    uid:Number,  //uid
    password:{type:String,required:true}, //密码 MD5加'adinno'盐
    Email:{type:String,regExp:"/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/",required:true},//邮箱，必填
    phone:{type:String,regExp:"/0?(13|14|15|17|18)[0-9]{9}/",required:true},//电话，必填
    face:{type:String,default:"/images/face.png"}, //头像url
    follows:[{type:mongoose.Schema.ObjectId,ref:"user"}],//关注
    fans:[{type:mongoose.Schema.ObjectId,ref:"user"}],//粉丝
    regTime:{type:String,default:Date.now},//注册时间
    lv:{type:Number,default:"1"},//等级
    regIp:String,//注册Ip
    channels:{type:mongoose.Schema.ObjectId,ref:"channel"},//频道
    admin:{type:Boolean,default:false},//是否为超级用户
    videos:[{type:mongoose.Schema.ObjectId,ref:"video"}],//视频
    weibo:String,//微博地址
    address:String,//地址
    IdCard:Number,//身份证号
    identify:{type:String,default:"没有权限"},//直播权限 ,"没有权限/允许直播"
    ipCamera:{type:Boolean,default:false},
    messages:[
        {user:{type:mongoose.Schema.ObjectId,ref:"user"},//详细留言
        msg:String,//留言
        time:{type:Date,default:Date.now},//时间
        unRead:{type:Boolean,default:true},//是否阅读过
        }
    ]
});

userSchema.static("getData",function(cb){
    return this.find({}).populate("channels videos").exec(cb)
});
userSchema.static("getOne",function(_id,cb){
    return this.findById(_id).populate("channels videos").exec(cb)
});
userSchema.static("search",function(find,filter,option,cb){
    return this.find(find,filter,option).select("name face uid _id channels videos").exec(cb)
});

var user = mongoose.model("user",userSchema);

module.exports = user;