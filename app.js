var http = require('http');
var express = require('express');
var routes = require('./routes');
var users = require('./routes/users');
var api = require("./routes/api");
var token = require("./routes/token");
var userToken = require("./routes/userToken");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require("passport");
var Strategy = require("passport-http-bearer").Strategy;
var fs= require("fs")
var accessLogStream = fs.createWriteStream(__dirname+"/public/log/"+parseInt(Date.now()/1000/3600/24)+".log")
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var config = require("./config");
var mongoose = require("mongoose");
var mongoStore = require("connect-mongo")(session);
mongoose.connect(config.dbUrl);
var method = require("./mongoose/index.js");
var ws = require("./socket");
var db = mongoose.connection;
var nodemailer = require('nodemailer');


db.once("open", function () {
    console.log("db connect")
});

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

var app = express();
// view engine setup
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(logger(':remote-addr :date[web] :url',{stream: accessLogStream}));
app.use(methodOverride());
app.use(_session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: 'uploads/'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(passport.initialize());
app.use(passport.session());

config.middleware(app);
passport.use(new Strategy(
    function(token, cb) {
        method.method.token
            .findOne({token:token})
            .populate({path:"user",
                     select:"_id name uid Email phone face follows fans regTime lv channels admin videos weibo address IdCard bank identify ipCamera messages"
            })
            .exec(function(err, user) {
            console.log(err,user);
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user.user);
        })
    }));

app.use('/', routes);
app.use('/users', users);
app.use("/api", api);
app.use("/token",token);
app.use("/userToken",userToken)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      ;
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = http.createServer(app);
ws.listen(server);


server.listen(config.port, function () {
    console.log("server started")
});
