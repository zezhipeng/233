var http = require('http');
var fs = require('fs');
var oppressor = require('oppressor');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/sample.mp4')
        .pipe(oppressor(req))
        .pipe(res);
});
server.listen(8000);