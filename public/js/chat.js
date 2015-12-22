/**
 * Created by zezhi on 2015/11/25.
 */
(function(){
    "use strict";
    angular.module("app",["btford.socket-io","ngAnimate"])
        .factory("mySocket",function(socketFactory){
            var _socket =socketFactory();
            _socket.forward("error");
            return _socket
        })
        .controller("ctrl",function($scope,mySocket){


            var serviceUrl = 'https://publicexprod.alipay.com/deliveraddress/index.htm?type=2';
            var callBridge = function () {
                var a = Array.prototype.slice.call(arguments, 0), fn = function () {
                    window.AlipayJSBridge.call.apply(null, a);
                };
                window.AlipayJSBridge ? fn() : document.addEventListener("AlipayJSBridgeReady", fn, false);
            };
            var am = window.am = (window.am || {});
            document.addEventListener('resume', function (event) {
                var data = event.data || {};
                var address = data.address;
                if (!!address && !!window.am._addressFn) {
                    try {
                        window.am._addressId = address.addressId;
                        window.am._addressFn.call(null, address);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }, false);
            am.selectAddress = function (cb) {
                this._addressFn = this._addressFn || cb;
                var param = '';
                !!this._addressId && (param = '&aid=' + this._addressId);
                callBridge('pushWindow', {
                    url: serviceUrl + param,
                    param: {
                        'showTitleBar': true,
                        'showToolBar': false,
                        'showTitlebar': true,
                        'showToolbar': false
                    }});
            }


            $scope.messages=[];
            mySocket.on("chatTest",function(data){
                data.top=$("#player").height()*(Math.random()*(-0.8)+0.8)+"px";
                $scope.data =data;
                $scope.messages.push(data)
            });
            $scope.sendMsg = function(){
                if($scope._msg.length>0){
                    mySocket.emit("chatTest",$scope._msg);
                    $scope._msg=""
                }
            };
            $scope.getLocation = function(){
                console.log("发送请求")
                am.selectAddress(function (data) {
                    console.log(JSON.stringify(data))
                })
            }

        })
})(window.angular);