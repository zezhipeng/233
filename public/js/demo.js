/**
 * Created by tf on 2015/10/28.
 */
"use strict";
var todo = angular.module("todo", ["ngRoute", "ngAnimate", "ngSanitize", "btford.socket-io", "ngResource"]);

todo.config(['$resourceProvider', function ($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);


todo.factory("api", function (socketFactory) {
    return socketFactory()
});
todo.factory("rest", function ($resource) {
    return $resource('/:collection', {collection: '@id'}, {"get": {method: "GET", isArray: true}});
})
todo.factory("req", function ($http, $q, $location) {
    var req = this;
    req.getVideos = function () {
        var defer = $q.defer();
        $http.get("/videos")
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    req.getChannels = function () {
        var defer = $q.defer();
        $http.get("/channels")
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    req.reg = function (regData) {
        var defer = $q.defer();
        $http.post("/reg", regData)
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    req.sign = function (signData) {
        var defer = $q.defer();
        $http.post("/sign", signData)
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    req.liveDetail = function (uid) {
        var defer = $q.defer();

        $http.get("/liveDetail?uid=" + uid)
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    req.account = function () {
        var defer = $q.defer();
        $http.get("/users/account")
            .success(function (res) {
                defer.resolve(res)
            })
            .error(function (err) {
                defer.reject(err)
            });
        return defer.promise
    };
    return req
});


//首页
todo.controller("indexCtrl", function ($scope, $http, req, rest) {
    $scope.groups = [{poster: "/images/meeting.jpg", name: "会晤", event: 162},
        {poster: "/images/study.jpg", name: "远程教育", event: 12},
        {poster: "/images/yiliao.jpg", name: "医学咨询", event: 16},
        {poster: "/images/enjoy.jpg", name: "娱乐", event: 14}
        //{poster:"/images/animals.jpg",name:"宠物",event:62}
    ];

});
//登录
todo.controller("signCtrl", function ($scope, $http, $window, req) {
    $scope.signData = null;
    $scope.error = false;
    $scope.sign = function () {
        req.sign($scope.signData)
            .then(function (res) {
                if (!res.err) {
                    $window.location.reload();

                }
                else {
                    $scope.error = "用户名或密码错误";
                }
            });
    }
});

//注册
todo.controller("regCtrl", function ($scope, $http, $window, req) {
    $scope.regData = null;
    $scope.error = false;
    $scope.reg = function () {
        req.reg($scope.regData).then(function (res) {
            if (!res.err) {
                $window.location.reload()
            }
            else {
                $scope.error = "用户已存在"
            }
        })
    }
});
//添加频道
todo.controller("addChannelCtrl", function ($scope, $http, $window) {
    $scope.channel = null;
    //上传开始
    var channelPoster = new plupload.Uploader({
        browse_button: "uploadPoster",
        url: "/users/uploadPoster",
        filters: {
            mime_types: [{title: "Image files", extensions: "jpg,png,jpeg,gif"}]
        }
    });
    channelPoster.init();
    channelPoster.bind("FilesAdded", function (uploader, files) {
        uploader.start();
    });
    channelPoster.bind("FileUploaded", function (uploader, file, responseObject) {
        console.log(responseObject.response);
        uploader.stop();
        $("#channelPoster").attr("src", responseObject.response);
        $scope.channel.poster = responseObject.response;
        $scope.$apply();
    });
    //上传结束
    $scope.submitChannel = function () {
        $scope.error = false;
        console.log($scope.channel);
        $http.post("/users/channel", $scope.channel).success(function (res) {
            $scope.error = res;
            if (!res) {
                $window.location.href = "/"
            }
        })
    }
});
//直播
todo.controller("liveCtrl", function ($scope, $http, $sce, api, req, $location, rest, $resource) {
    $scope.needSign = false;
    $scope.live = null;
    $scope.videos = null;
    $scope.bc = []
    $scope.messages = []
    api.emit("join", uid);
    $scope.sendMsg = function (msg) {
        if (msg) {
            api.emit("msg", $scope.msg);
            $scope.msg = ''
        }
    };
    api.on("msg", function (msg) {
        $scope.messages.unshift(msg);
        $scope.$apply()
    });
    api.on("system", function (msg) {
        $scope.bc.push("系统提示：" + msg + "加入频道");
        setTimeout(function () {
            $scope.bc.shift()
            $scope.$apply()
        }, 5000)
    });
    $.ajax({
        url:"/liveDetail/"+uid,
        type:"get",
        success:function(res){
            $scope.live = res
            console.log(res)
            var reg = new RegExp("/n", "g");
            $scope.live.channels.alert = $scope.live.channels.alert.replace(reg, "<br>")
            //console.log($scope.live.channels.alert)
            $scope.live.channels.alert = $sce.trustAsHtml($scope.live.channels.alert)
            $scope.$apply()
        }
    })
    //$resource("/liveDetail/:_id", {_id: "@id"}, {"get": {method: "get", isArray: false}})
    //    .get({collection: "liveDetail", _id: uid})
    //    .$promise.then(function (res) {
    //    $scope.live = res
    //    //console.log(res)
    //    var reg = new RegExp("/n", "g");
    //    $scope.live.channels.alert = $scope.live.channels.alert.replace(reg, "<br>")
    //    //console.log($scope.live.channels.alert)
    //    $scope.live.channels.alert = $sce.trustAsHtml($scope.live.channels.alert)
    //});

    $scope.addFollow = function (channels) {
        $http
            .put("/users/addFollow", {channels: channels})
            .success(function (res) {
                if (!res) {
                    alert("添加成功")
                }
                else {
                    alert("已关注")
                }
            })
    }
});
//上传视频
todo.controller("uploadVideoCtrl", function ($scope, $http) {
    $scope.video = null;
    $scope.save = function () {
        $http.post("/users/video", $scope.video).success(function (res) {
            if (!res) {
                $scope.video = [];
                alert("保存成功")
            }
        })
    }
});


//头像
todo.controller("accountCtrl", function ($scope, $http, req) {
    $scope.user = null;
    req.account()
        .then(function (res) {
            $scope.user = res;
            console.log($scope.user)
        });
    $scope.remove = function (_id) {
        $http
            .delete("/users/video/" + _id)
            .success(function (res) {
                $scope.user.videos = [];
                $http
                    .get("/users/video")
                    .success(function (res) {
                        $scope.user.videos = res.videos

                    });
            })

    };
    //上传头像开始
    var uploadFace = new plupload.Uploader({
        browse_button: "uploadFace",
        url: "/users/uploadFace",
        filters: {
            mime_types: [{title: "Image files", extensions: "jpg,png,jpeg,gif"}]
        }
    });
    uploadFace.init();
    uploadFace.bind("FilesAdded", function (uploader, files) {
        uploader.start();
    });
    uploadFace.bind("FileUploaded", function (uploader, file, responseObject) {
        console.log(responseObject.response);
        uploader.stop();
        $("#face").attr("src", responseObject.response);
    });
    //上传头像结束
    $scope.save = function () {
        console.log($scope.user);
        $http
            .put("/users/account", $scope.user)
            .success(function (res) {
                if (!res) {
                    alert("保存成功")
                }
            })
    };
    //保存新密码
    $scope.savePwd = function () {
        if ($scope.user.Pwd == $scope.user.rePwd) {
            $http.put("/users/password", $scope.user).success(function (res) {
                console.log(res);
                if (!res) {
                    alert("新密码已生效")
                }
                else {
                    alert("密码错误")
                }
                ;
            });
            return
        }
        alert("两次密码不一致");
        return
    }
});

//录像
todo.controller("videoCtrl", function ($scope, $http, req, $resource, rest) {
    $scope.comments = [];
    $scope.comment = "";
    $.ajax({
        url:"/comments/"+videoId,
        type:"get",
        success:function(res){
            $scope.comments = res
            $scope.$apply()
        }
    })



    $scope.addComment = function (msg) {
        $scope.comment = '';
        $http.post("/users/addComment/" + videoId, {msg: msg}).success(function (res) {
            $scope.comments = res
        })
    };

});
//修改我的频道
todo.controller("channelCtrl", function ($scope, $http) {
    $scope.channel = null;
    $http
        .get("/users/myChannel")
        .success(function (res) {
            console.log(res);
            $scope.channel = res
        })

    var channelPoster = new plupload.Uploader({
        browse_button: "uploadPoster",
        url: "/users/uploadPoster",
        filters: {
            mime_types: [{title: "Image files", extensions: "jpg,png,jpeg,gif"}]
        }
    });
    channelPoster.init();
    channelPoster.bind("FilesAdded", function (uploader, files) {
        uploader.start();
    });
    channelPoster.bind("FileUploaded", function (uploader, file, responseObject) {
        console.log(responseObject.response);
        uploader.stop();
        $("#channelPoster").attr("src", responseObject.response);
        $scope.channel.poster = responseObject.response;
        $scope.$apply();
    });
    $scope.save = function () {
        $http.put("/users/channelSet", $scope.channel).success(function (res) {
            if (!res) {
                alert("保存成功")
            }
        })
    }
});



