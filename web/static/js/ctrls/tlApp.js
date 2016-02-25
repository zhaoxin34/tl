var tlApp = angular.module('tlApp', ['ngRoute', 'ngMessages','datetimepicker', 'textAngular', 'ngFileUpload']);
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
.filter('toDate', function() {
  return function(input) {
    if (!input)
        return new Date();
    return new Date(input);
  };
})
.config(function($provide) {
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
        taRegisterTool('test', {
            buttontext: 'Test',
            action: function() {
                alert('Test Pressed')
            }
        });
        taOptions.toolbar[1].push('test');
        taRegisterTool('colourRed', {
            iconclass: "fa fa-square red",
            action: function() {
                this.$editor().wrapSelection('forecolor', 'red');
            }
        });
        // add the button to the default toolbar definition
        taOptions.toolbar[1].push('colourRed');
        taOptions.toolbar = [
            ['h1', 'h2', 'h3', 'h4', 'p', 'pre', 'quote'],
            ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
            ['insertImage','insertLink']
        ];
        taOptions.classes = {
            toolbarButton: "btn btn-default btn-sm btn-white"
        };
        return taOptions;
    }]);
});
