/**
 * Created by zezhi on 2015/12/3.
 */
var mongoose = require("mongoose");
var randtoken = require('rand-token');
var tokenSchema = mongoose.Schema({
    token:{type:String,default:function(){
        return randtoken.generate(32)
    }},
    user:{type:mongoose.Schema.ObjectId,ref:"user",unique:true},
    create:{type:Date,default:Date.now()}
});

tokenSchema.static("createToken" , function(user,cb){

})

tokenSchema.static("getData",function(cb){
    return this.find({}).populate("user").exec(cb)
})
var token = mongoose.model("token",tokenSchema);

module.exports=token;
