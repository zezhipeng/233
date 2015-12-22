/**
 * Created by Administrator on 2015/11/12.
 */



//管理员

todo.controller("adminCtrl",function($scope,$http,$filter,$window,api){
    //用户
    api.emit("join","admin");
    api.emit("monitor",{});
    //setInterval(function(){
    //    api.emit("monitor",{})
    //},10000);

    api.on("monitor",function(data){
        console.log(data);

       $scope.monitor =data
    })
    $http.get("/api/log").success(function(res){
        console.log(res)
        $scope.log=res
    })
    $http.get("/api/v1/users").success(function(res){
        $scope.users = res;

        console.log($scope.users)
    });
    $http.get("/api/v1/token").success(function(res){
        $scope.tokens = res
    })
    $scope.createToken = function(user){
        $http.post("/api/v1/token",{user:user}).success(function(res){
            alert("添加成功")
            $http.get("/api/v1/users").success(function(res){
                $scope.users = res;
                //console.log($scope.users)
            });
        })
    }
    //修改用户
    $scope.userUpdate = function(user){
        $http.put("/api/v1/users/"+user._id,user).success(function(res){
            if(res){
                $window.location.reload()
            }
        })
    };
    //线路
    $http.get("/api/v1/lines").success(function(res){
        console.log(res);
        $scope.lines=res;
    });
    //新线路
    $scope.saveLine = function(){
        $http.post("/api/v1/lines",$scope.line).success(function(res){
            if(!res){
                alert("保存成功")
            }
        })
    };
    //线路修改
    $scope.lineUpdate = function(line){
        $http.put("/api/v1/lines/"+line._id,line).success(function(res){
            $window.location.reload()
        })
    }
    //视频
    $http.get("/api/v1/videos").success(function(res){
        $scope.videos=res;
    });
    $http.get("/api/v1/channels").success(function(res){
        $scope.channels =res
    })
    $scope.upIndex = function(_id){
        $http.put("/api/v1/channels/"+_id,{index:true}).success(function(res){
            $window.location.reload()
        })
    }
    $scope.downIndex = function(_id){
        $http.put("/api/v1/channels/"+_id,{index:false}).success(function(res){
            $window.location.reload()
        })
    }
    $scope.pencil=function(user){
        $scope.userUp = user
        console.log(user)
    }
    //删除
    $scope.handleDelete = function(user){
        var del = confirm("确定删除："+user.name)
        if(del){
            $http.delete("/api/v1/users/"+user._id).success(function(res){
                $http.get("/api/v1/users").success(function(res){
                    $scope.users = res;
                })
            })
        }
    }
    //http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=115.156.238.114

});