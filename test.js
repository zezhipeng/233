var fs = require('fs');

var getUsage = function(cb){
    fs.readFile("/proc/" + process.pid + "/stat", function(err, data){
        var elems = data.toString().split(' ');
        var utime = parseInt(elems[13]);
        var stime = parseInt(elems[14]);

        cb(utime + stime);
    });
}

setInterval(function(){
    getUsage(function(startTime){
        setTimeout(function(){
            getUsage(function(endTime){
                var delta = endTime - startTime;
                var percentage = 100 * (delta / 10000);

                if (percentage > 20){
                    console.log("CPU Usage Over 20%!");
                }
            });
        }, 1000);
    });
}, 10000);