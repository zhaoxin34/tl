var phonecatApp = angular.module('phonecatApp', [
    'ngRoute',
    'phonecatControllers'
]);

phonecatApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/phones', {
            templateUrl: '/test-ng/phone-list.html',
            controller: 'PhoneListCtrl'
        }).
        when('/phones/:phoneId', {
            templateUrl: '/test-ng/phone-detail.html',
            controller: 'PhoneDetailCtrl'
        }).
        otherwise({
            redirectTo: '/phones'
        });
    }
]);

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', '$http',
    function($scope, $http) {
        $http.get('/phone/phones').success(function(data) {
            $scope.phones = data.data;
        });
        $scope.orderProp = 'age';
    }
]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams',
    function($scope, $routeParams) {
        $scope.phoneId = $routeParams.phoneId;
    }
]);
