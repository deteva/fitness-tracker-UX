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

//enegetic part chart
				$scope.options = {
					chart: {
						type: 'bulletChart',
						transitionDuration: 500,
						height:7,
						width:260,
						margin : {
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						},
						showXAxis:"false",
						showYAxis:"false",
						interactive:"true",
						tooltips:"true"
					}
				};
				//calories
				//"calories" : {
				//	"weekAgoToday" : 1366,
				//		"yesterday" : 2304,
				//		"today" : 675,
				//		"lastWeek" : 1552
				//}
				$scope.dataCals = {
					"ranges": [2358, 1552,0],
					"measures": [675],
					"markers": [2304]
				};

				//Steps
				$scope.dataSteps = {
					"ranges": [10000,4155, 0],
					"measures": [2000],
					"markers": [9956]
				};

				//ActivityCalories
				$scope.dataActivityCalories = {
					"ranges": [30, 29, 0],
					"measures": [20],
					"markers": [30]
				};
				//Floors
				$scope.dataFloors = {
					"ranges": [10, 28, 0],
					"measures": [7],
					"markers": [5]
				};
				//Distance
				$scope.dataDistance = {
					"ranges": [8.05, 2.04, 0],
					"measures": [1.04],
					"markers": [6.5]
				};
			}
		}
	}
})();