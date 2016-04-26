/**
 * Created by tmin_lim on 16. 4. 25..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('feedback', FeedBack);

	FeedBack.$inject = ['dataAPI'];

	function FeedBack(dataAPI) {
		console.log('directive feedback in');
		return {
			templateUrl: '/app/components/feedback/feedback.html',
			restrict: 'E',
			controller: function($scope) {
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;
			}
		}
	}
})();