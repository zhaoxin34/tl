tlApp.controller('timeline', ['$scope',
    function($scope) {
      var timeline = new TL.Timeline('timeline', '/timeline_data/wedding.html', {ga_property_id: "UA-27829802-4"});
    }
]);