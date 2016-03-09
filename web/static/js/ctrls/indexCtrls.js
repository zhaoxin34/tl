tlApp.config(['$routeProvider', function($routeProvider) {
    // $routeProvider
    // .when('/login', {
    //     controller: 'tlLoginCtrl',
    //     templateUrl: 'views/login.html'
    // })
    // .otherwise({redirectTo: ''});
}])
// 首页控制
.controller('indexCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        $rootScope.loginInfo = {
            status: false
        };
        $scope.showLogin = function() {
            $('#loginFormError').css('display', 'none');
            $('#loginWindow').modal('show');
        };
        // 显示注册dialog
        $scope.showRegist = function() {
            $('#registFormError').css('display', 'none');
            $('#registWindow').modal('show');
        };
       // 退出登陆
        $scope.logout = function() {
            var req = {
                method: 'POST',
                url: '/user@logout.do',
                headers: {
                },
                data: {}
            };
            $http(req).success(function(data) {
                $rootScope.user = null;
                $rootScope.loginInfo.status = false;
            });
            if ($location.url() != '' || $location.url()!= '/') {
                $location.url('');
            }
        };
    }
]);