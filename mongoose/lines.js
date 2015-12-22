/**
 * Created by Administrator on 2015/9/2.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var lineSchema = Schema({
        name:String,
        ip:String,
        rtmp:String,
        hls:String,
        online:{type:Number,default:0},
        sort:Number,
        limit:Number,
        status:{type:String,default:"ready"}
});
lineSchema.static("getData",function(cb){
        return this.find({}).exec(cb)
});
lineSchema.static("getOne",function(_id,cb){
        return this.findById(_id).exec(cb)
});
var lineModel = mongoose.model("line",lineSchema);

module.exports = lineModel;