tlApp.controller('userTlCtrls', ['$scope', '$http', '$rootScope', '$location', 'Upload',
    function($scope, $http, $rootScope, $location, Upload) {
        $scope.tl = {};
        // 上传后图片的值
        $scope.tl.uploadedFilename = null;
        $scope.isUploadSuccess = false;
        $scope.isUploaded = false;
        $scope.isUploading = false;

        // 清除图片
        $scope.clearUploadImage = function() {
            $scope.tl.image = null;
            $scope.tl.uploadedFilename = null;
            $scope.isUploaded = false;
            $scope.isUploading = false;
        };
        // 上传图片
    	$scope.uploadImage = function() {
            $scope.isUploading = true;
    		Upload.upload({
    		    url: '/user/upload',
    		    data: {file: $scope.tl.image}
    		}).then(function (resp) {
                $scope.tl.uploadedFilename = resp.data.body.filename;
                $scope.isUploading = false;
                $scope.isUploaded = true;
                $scope.isUploadSuccess = true;
                console.log($scope.tl);
    		}, function (resp) {
                $scope.isUploading = false;
                $scope.isUploadSuccess = false;
    		}, function (evt) {
    		    // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
    		    // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    		});
    	};

        $scope.submitTlCreate = function() {
            $scope.loading = true;
            var req = {
                method: 'POST',
                url: '/user/submitTlCreate',
                headers: {
                },
                data: $scope.tl
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
        };
    }
]);