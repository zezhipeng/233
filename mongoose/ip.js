/**
 * Created by Administrator on 2015/11/13.
 */
var mongoose = require("mongoose");
var ipSchema = mongoose.Schema({
    ip:String,
    user:{type:mongoose.Schema.ObjectId,ref:"user"}
});


ipSchema.static("getData",function(cb){
    return this.find({}).exec(cb)
});
ipSchema.static("getOne",function(_id,cb){
    return this.findById(_id).exec(cb)
});
var ip = mongoose.model("ip",ipSchema);

module.exports = ip;