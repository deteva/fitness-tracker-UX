/**
 * Created by tmin_lim on 16. 4. 25..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('numberToday', NumberToday);

	NumberToday.$inject = ['dataAPI', 'foodAPI'];

	function NumberToday(dataAPI, foodAPI) {
		console.log('directive numberToday in');
		return {
			templateUrl: '/app/components/number-today/number-today.html',
			restrict: 'E',
			controller: function($scope, $timeout, $q, $log) {
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;
				//"amount": ["1 인분", "1.5인분", "2 인분", "2.5인분"],

				$scope.isDisabled = false;
				$scope.querySearch = querySearch;

				$scope.foods = foodAPI;
				$log.info($scope.foods);

				$scope.amout = ["15ml", "1인분", "1.5인분", "1컵"];
				$scope.selectedAmount = null;
				$scope.amountText = null;
				//$scope.queryAmount = queryAmount;

				function querySearch (query) {
					var results = query ? self.states.filter( createFilterFor(query) ) : $scope.foods;
					return results;
				}

				function createFilterFor(query) {
					return function filterFn(foods) {
						return (foods.name.indexOf(query) === 0);
					};
				}
			}
		}
	}
})();