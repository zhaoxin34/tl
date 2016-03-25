var tlApp = angular.module('tlApp', ['ngRoute', 'ngMessages','datetimepicker',  'ngFileUpload']);
tlApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '',
            controller: ''
        })
        .when('/user/userinfo', {
            templateUrl: '/views/user/userinfo.html',
            controller: 'userinfoCtrl'
        })
        .when('/user/tl/create', {
            templateUrl: '/views/user/tl/create.html',
            controller: 'userTlCtrls'
        })
        .when('/timeline', {
            templateUrl: '/views/timeline.html',
            controller: 'timelineCtrls'
        })
        .otherwise({
            redirectTo: ''
        });
}])
.run(['$rootScope', '$location', function($rootScope, $location) {
	$rootScope.$on("$locationChangeStart", function(event, newUrl, oldUrl){ //this gets triggered
        if (newUrl !== oldUrl) {
            // 用户未登录
            if (!$rootScope.loginInfo || !$rootScope.loginInfo.status) {
                // /user 打头的是需要登录的
                if ($location.url().startsWith('/user')) {
                    $location.url('');
                    $location.replace();
                }
            }
        }
	});
}])
// 初始化时间控件
.config([
    'datetimepickerProvider',
    function (datetimepickerProvider) {
        datetimepickerProvider.setOptions({
            locale: 'zh-cn',
            format: 'YYYY-MM-DD HH:mm',
            icons: {
                next:'glyphicon glyphicon-arrow-right',
                previous:'glyphicon glyphicon-arrow-left',
                up:'glyphicon glyphicon-arrow-up',
                down:'glyphicon glyphicon-arrow-down'
            }
        });
    }
])
// 将时间字符串转化成时间类型
.filter('toDate', function() {
  return function(input) {
    if (!input)
        return new Date();
    return new Date(input);
  };
})
// 处理ajax 系统级别的错误
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $rootScope) {
        return {
            'response': function (response) {
                if (response.data && response.data.header) {
                    // 系统错误, 如数据库连接不上
                    if (response.data.header.status <= -100) {
                        $rootScope.message = response.data.header.errorMsg;
                        $('#messageWindow').modal('show');
                    }
                }
                return response;
            },
            // optional method
            // 系统错误，如服务器连接不上
           'responseError': function(rejection) {
                $rootScope.message = '系统繁忙!';
                $('#messageWindow').modal('show');
            }
        };
    });
}]);
// 富文本编辑器 配置项 目前暂时不用了
// .config(function($provide) {
//     $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
//         taRegisterTool('test', {
//             buttontext: 'Test',
//             action: function() {
//                 alert('Test Pressed')
//             }
//         });
//         taOptions.toolbar[1].push('test');
//         taRegisterTool('colourRed', {
//             iconclass: "fa fa-square red",
//             action: function() {
//                 this.$editor().wrapSelection('forecolor', 'red');
//             }
//         });
//         // add the button to the default toolbar definition
//         taOptions.toolbar[1].push('colourRed');
//         taOptions.toolbar = [
//             ['h1', 'h2', 'h3', 'h4', 'p', 'pre', 'quote'],
//             ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
//             ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
//             ['insertImage','insertLink']
//         ];
//         taOptions.classes = {
//             toolbarButton: "btn btn-default btn-sm btn-white"
//         };
//         return taOptions;
//     }]);
// });
