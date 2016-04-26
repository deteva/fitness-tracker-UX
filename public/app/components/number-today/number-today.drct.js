/**
 * Created by tmin_lim on 16. 4. 25..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('numberToday', NumberToday);

	BodyShape.$inject = ['dataAPI'];

	function NumberToday(dataAPI) {
		console.log('directive numberToday in');
		return {
			templateUrl: '/app/components/number-today/number-today.html',
			restrict: 'E',
			controller: function($scope) {
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;
			}
		}
	}
})();