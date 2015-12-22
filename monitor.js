var os = require("os");
var v8 = require("v8")
function sysLog(cb){
    var callback={}
    var network = os.networkInterfaces()
    var memory = process.memoryUsage();
    var hostname =os.hostname()
    var memoryUsed = Math.round(memory.heapUsed/memory.heapTotal*100)
    var cpus = os.cpus();
    var count =[];
    for(var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i], total = 0, processTotal = 0, strPercent ={};
        for(type in cpu.times){
            total += cpu.times[type];
        }
        for(type in cpu.times){
            var percent = Math.round(100 * cpu.times[type] / total);
            strPercent[type] =percent;
            if(type != 'idle'){
                processTotal += percent;
            }
        }
        count.push(strPercent)
    }
    callback.log= os.loadavg()
    callback.cpus=cpus
    callback.cpu=count;
    callback.memory=memoryUsed;
    callback.netword=network;
    callback.platform=os.platform()
    return cb(callback)
}


var sysLogSync = function(){
    return new Promise(function(resolve,reject){
        sysLog(function(cb){
            resolve(cb)
        })
    })
}

module.exports=sysLogSync;

