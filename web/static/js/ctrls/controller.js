var tlApp = angular.module('tlApp', [
    'ngRoute',
    'tlControllers'
]);

var tlControllers = angular.module('tlControllers', []);

tlControllers.controller('tlLoginCtrl', ['$scope', '$http',
    function($scope, $http) {
    	$scope.user = {username: '', password: ''};
        $scope.login = function() {
            var req = {
                method: 'POST',
                url: '/login',
                headers: {
                },
                data: $scope.user
            };
            $http(req).success(function(data) {
            	$scope.loginInfo.url = '/nav-userinfo.html';
            	$('#loginWindow').modal('hide');
            });
        };
        $scope.loginInfo = {
            url: 'nav-login.html'
        };
    }
]);
