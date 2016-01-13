/**
 * Created by tf on 2015/11/21.
 */
var io = require("socket.io")();
var ios = require('socket.io-express-session');
var method = require("./mongoose/index");
var session = require('express-session');
var mongoose = require("mongoose");
var db = mongoose.connection;
var monitor = require("./monitor")
var fs = require("fs");
var WavEncoder = require("wav-encoder");
var mongoStore = require("connect-mongo")(session);
var store = new mongoStore({
    mongooseConnection: db,
    ttl: 7 * 24 * 60 * 60
});

var _session = session({
    resave: true,
    saveUninitialized: true,
    secret: 'uwotm8',
    store: store
});
//socket-session中间件
io.use(ios(_session));

io.sockets.on("connection", function (socket) {
    socket.on("join", function (uid) {
        socket.roomId = uid;
        socket.join(socket.roomId);
        method.method.users
            .findOne({uid: uid})
            .select("channels")
            .exec(function (err, cb) {
                if (cb) {
                    socket.channelId = cb.channels;
                    method.method.channels
                        .findOneAndUpdate({_id: cb.channels}, {$inc: {viewers: 1}})
                        .exec(function (err, cb) {
                            //console.log("人数添加",err,cb)
                            if (socket.handshake.session.user) {
                                io.sockets.in(socket.roomId).emit("system", socket.handshake.session.user.name)
                            }
                        });
                }
            });

        //console.log(socket.client)
    });
    //监听消息
    socket.on("msg", function (msg) {
        var message = {};
        message.msg = msg;
        message.user = socket.handshake.session.user;
        io.sockets.in(socket.roomId).emit("msg", message)
    });
    //admin监听，查看硬件信息
    socket.on("monitor", function () {
        monitor().then(function (cb) {
            io.sockets.in("admin").emit("monitor", cb)
        })
    });

    socket.on("disconnect", function () {
        method.method.channels
            .findOneAndUpdate({_id: socket.channelId}, {$inc: {viewers: -1}})
            .exec()
    });


    //音频监听
    socket.on("audio", function (audio) {
        fs.writeFile(__dirname + "/public/audio/test.wav", audio, function (err) {
            socket.emit("audio", "/audio/test.wav")
        })
    })
});

module.exports = io;