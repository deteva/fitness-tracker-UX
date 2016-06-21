/**
 * Created by tmin_lim on 16.
 * 4. 11..
 */

(function() {
	'use strict';

	angular
		.module('app.core')
		.controller('MainCtrl', MainCtrl)
		.directive('ngWidth', function () {
			return function(scope, element, attrs) {
				scope.$watch(attrs.ngWidth, function(value) {
					element.attr('width', value);
				});
			};
		});

	MainCtrl.$inject = ['activityByfitbit','heartrateByfitbit','nutritionByfitbit','sleepByfitbit','socialByfitbit','$scope', 'dataAPI','$log'];

	function MainCtrl(activityByfitbit, heartrateByfitbit, nutritionByfitbit, sleepByfitbit, socialByfitbit, $scope, dataAPI, $log) {
		$log.info('app.core MainCtrl in!');
		//$log.log(activityByfitbit);
		//debugger;
		$scope.activityData = activityByfitbit;
		$scope.heartrateData = heartrateByfitbit;
		$scope.waterData = nutritionByfitbit;
		$scope.sleepData = sleepByfitbit;
		$scope.friendData = socialByfitbit;

	}
})();