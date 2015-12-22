
function appendTransform(defaults, transform) {

    // We can't guarantee that the default transformation is an array
    defaults = angular.isArray(defaults) ? defaults : [defaults];

    // Append the new transformation to the defaults
    return defaults.concat(transform);
}
angular.module("todo",[])
    .config(function($httpProvider){
    })
    .controller("indexCtrl",["$scope","$http",function($scope,$http){
        $scope.channels=[];
        $scope.videos=[]
        $scope.get=function(){
            $http({
                url: '/channels',
                method: 'GET',
                transformResponse: appendTransform($http.defaults.transformResponse, function(value) {
                    return appendTransform(value);
                })
            }).then(function(res){
                console.log(res)
            })

        }

    }])
