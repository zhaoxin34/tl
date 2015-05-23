var tlApp = angular.module('tlApp', [
    'ngRoute',
    'tlControllers'
]);

var tlControllers = angular.module('tlControllers', []);

// 登陆退出以及用户信息controller
tlControllers.controller('tlLoginCtrl', ['$scope', '$http',
    function($scope, $http) {
        // 初始化参数
    	$scope.user = {username: '', password: ''};
        $scope.loginInfo = {
            status: false
        };
        // 登陆
        $scope.login = function() {
            var req = {
                method: 'POST',
                url: '/login',
                headers: {
                },
                data: $scope.user
            };
            $http(req).success(function(data) {
                $scope.user = data.body;
            	$scope.loginInfo.status = true;
            	$('#loginWindow').modal('hide');
            });
        };
        // 退出登陆
        $scope.logout = function() {
            var req = {
                method: 'POST',
                url: '/logout',
                headers: {
                },
                data: {}
            };
            $http(req).success(function(data) {
                $scope.user = {username: '', password: ''};
                $scope.loginInfo.status = false;
            });
        };
    }
]);
