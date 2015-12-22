/**
 * Created by Administrator on 2015/11/6.
 */
var mongoose = require("mongoose");
var channels = require("./channels");
var videos = require("./videos");
var users = require("./users");
var lines = require("./lines");
var official = require("./official.js")
var method = {
    channels:channels,
    videos:videos,
    users:users,
    lines:lines,
    official:official
    }
exports.method = method;