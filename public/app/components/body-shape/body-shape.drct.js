/**
 * Created by tmin_lim on 16. 4. 22..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('bodyShape', BodyShape);

	BodyShape.$inject = ['dataAPI'];

	function BodyShape(dataAPI) {
		console.log('directive bodyShape in');
		return {
			templateUrl: '/app/components/body-shape/body-shape.html',
			restrict: 'E',
			controller: function($scope) {
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;
			}
		}
	}
})();