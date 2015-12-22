/**
 * Created by Administrator on 2015/10/28.
 */
var mongoose = require("mongoose");
var officialSchema = mongoose.Schema({
    name:{type:String,unique:true},
    userCount:{type:Number,default:0},
    CDN:[{
        ip:String,
        name:String,
        limit:Number,
        status:{type:String,default:"空闲"}
    }],
    click:Number
});
officialSchema.static("getData",function(cb){
    return this.find({}).exec(cb)
});
officialSchema.static("getOne",function(_id,cb){
    return this.findById(_id).exec(cb)
});
var official = mongoose.model("official",officialSchema);

module.exports = official;