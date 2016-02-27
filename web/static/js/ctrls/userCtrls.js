tlApp.directive('ensureUnique', function($http) {
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, ngModel) {
            scope.$watch(attrs.ngModel, function(n) {
                if (!n) return;
                ngModel.$setValidity('checking', false);
                $http({
                    method: 'POST',
                    url: '/common@check.do',
                    data: {
                        field: attrs.ensureUnique,
                        value: ngModel.$modelValue
                    }
                }).success(function(data) {
                    ngModel.$setValidity('unique', data.body.unique);
                    ngModel.$setValidity('checking', true);
                })['catch'](function() {
                    ngModel.$setValidity('unique', false);
                    ngModel.$setValidity('checking', true);
                });
            });
        }
    };
})
// 登陆退出以及用户信息controller
.controller('loginCtrl', ['$scope', '$http', '$rootScope', '$location',
    function($scope, $http, $rootScope, $location) {
        // 初始化参数
    	$scope.user = {username: '', password: ''};
        $scope.loginInfo = {
            status: false
        };
        // 登陆
        $scope.submitLogin = function() {
            var req = {
                method: 'POST',
                url: '/user@login.do',
                headers: {
                },
                data: $scope.user
            };
            $scope.loading = true;
            $http(req).success(function(data) {
                // 登陆正确
                if (data.header.status == 0) {
                    $rootScope.user = data.body;
                    $rootScope.loginInfo = {status: true};
                    $('#loginWindow').modal('hide');
                    $scope.loading = false;
                }
                // 登录失败
                else {
                    $('#loginFormError').css('display', '');
                    $('#loginFormError').text(data.header.errorMsg);
                    $scope.loading = false;
                }
            });
        };

        // 尝试自动登录
        $scope.tryAutoLogin = function() {
            var req = {
                method: 'POST',
                url: '/user@autologin.do',
                headers: {
                },
                data: {}
            };
            $http(req).success(function(data) {
                // 登陆正确
                if (data.header.status == 0) {
                    $rootScope.user = data.body;
                    $rootScope.loginInfo = {status: true};
                    $('#loginWindow').modal('hide');
                    $scope.loading = false;
                } else if ($location.url() != '' || $location.url()!= '/') {
                    $location.url('');
                }
            });
        };
        $scope.tryAutoLogin();
    }
])
.controller('registCtrl', ['$scope', '$http', '$rootScope', '$timeout',
    function($scope, $http, $rootScope, $timeout) {
        $scope.submitRegist = function() {
            $scope.loading = true;
            var req = {
                method: 'POST',
                url: '/user@regist',
                headers: {
                },
                data: {
                    'username': $scope.username,
                    'email': $scope.email,
                    'password': $scope.password
                }
            };
            $http(req).success(function(data) {
                if (data.header.status == 0) {
                    $('#registWindow').modal('hide');
                    // show the success window
                    $rootScope.message = '更新成功!';
                    $('#messageWindow').modal('show');
                    $timeout(function() {
                        $('#messageWindow').modal('hide');
                    }, 1000);
                    $scope.loading = false;
                }
                else {
                    $('#registFormError').css('display', '');
                    $('#registFormError').text(data.header.errorMsg);
                    $scope.loading = false;
                }
            });
            // }).error(function() {});

        };
        $('#registFormError').css('display', 'none');
    }
])
.run(['$rootScope', '$location', function($rootScope, $location)  {
    // $rootScope.$on('$routeChangeSuccess', function(evt, next, current) {
    //     if (next.originalPath === '/login'){
    //         $('#loginWindow').modal('show');
    //     }
    // });
    $rootScope.$on("$includeContentLoaded", function(event, templateName){
        // $('#registWindow').modal('show');
        // $('#loginWindow').modal('show');
        $rootScope.message = '更新成功!';
        // $('#messageWindow').modal('show');
        if (templateName.endsWith('user/views/regist.html')) {
        }
    });
}]);
