/**
 * Created by tmin_lim on 16. 4. 25..
 */
(function() {
	'use strict';
	angular
		.module('app.core')
		.directive('numberToday', NumberToday);

	NumberToday.$inject = ['dataAPI', 'foodAPI', '$filter'];

	function NumberToday(dataAPI, foodAPI, $filter) {
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
				//$scope.selectedAmount = null;
				//$scope.amountText = null;
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

				//Math.floor((this.distance.today / this.goals.distance ) * 100);
				//icon-data part
				var iconBasePoint = 5;
				var iconEndPoint = 32;
				function countWidthByIcon(efficency) {
					var iconWidth = iconEndPoint - iconBasePoint;
					var width = (efficency * iconWidth ) /100;
					console.log("count icon width: " + width);
					return width;
				}
				//water of body part

				var bodyDownPoint = 700;
				var bodyUpPoint = 110;
				function countWidthByBody(efficency) {
					var bodyWidth = bodyDownPoint - bodyUpPoint;
					var height = (efficency * bodyWidth) /100;
					console.log("count water of body height: " + height);
					return height;
				}
				//all data
				$scope.targets = [
					{
						"display" : "수면시간",
						"name" : "totalTimeInBed",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-totalTimeInBed.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "꿀잠",
						"name" : "totalMinutesAsleep",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-totalMinutesAsleep.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "심박수 측정",
						"name" : "restingHeartRate",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-restingHeartRate.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "물마시기",
						"name" : "water",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-water.svg",
						"efficiency" : ($scope.waterData.today * 100 ) / $scope.waterData.goal,
						//"iconRatio" : countWidthByIcon($scope.targets[$scope.indexOfTarget.water].efficiency),
						//"bodyRatio" : countWidthByBody($scope.targets[$scope.indexOfTarget.water].efficiency)
					},
					{
						"display" : "건강한 식단",
						"name" : "foodPlan",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-foodPlan.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "음식계획",
						"name" : "estimatedCaloriesOut",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-estimatedCaloriesOut.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "몸무게 확인",
						"name" : "logWeight",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-logWeight.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "칼로리 소비",
						"name" : "calories",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-calories.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "걸음수",
						"name" : "steps",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-steps.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "활동적 시간",
						"name" : "activityCalories",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-activityCalories.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "층수",
						"name" : "floors",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-floors.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					},
					{
						"display" : "이동 거리",
						"name" : "distance",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-distance.svg",
						"efficiency" : $scope.sleepData.efficiency.lastWeek,
						"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
					}
				];

				//get index of $scope.targets
				$scope.filterSearch = function (filterTarget) {
					$filter("filter")($scope.targets, function(ele, idx) {
						if(ele.name === filterTarget ) return idx;
						else return false;
					});
				};

				//set data object index
				$scope.indexOfTarget = {};
				//$scope.targets[$scope.indexOfTarget.water]
				angular.forEach($scope.targets, function(element, idx){
					$scope.indexOfTarget[element.name] = idx;
				});

				//enegetic part chart
				$scope.options = {
					chart: {
						type: 'bulletChart',
						transitionDuration: 500,
						height:9,
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
						tooltips:"true",
						vertical:"false"
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
					"markers": [1300]
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
					"markers": [20]
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

				//$scope.dataIcons = [
				//	{
				//		"totalTimeInBed" :{
				//			"efficiency" : $scope.sleepData.efficiency.lastWeek,
				//			"iconRatio" : countWidthByIcon($scope.sleepData.efficiency.lastWeek)
				//		}
				//	}
				//]



			}
		}
	}
})();