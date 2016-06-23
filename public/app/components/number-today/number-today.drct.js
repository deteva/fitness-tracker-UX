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

				//fn split a string: using on happy section
				//startTime:
				//	lastWeek: ""
				//	today: "05:18"
				//	yesterday: "05:10"
				//	weekAgoToday:""
				$scope.strSplit = function(string, idx) {
					var array = string.split(':');
					return array[idx];
				}

				$scope.caculateTotalSleepTime = function(totalTime, idx) {
					var time = [];
					var hours = Math.floor(totalTime / 60);
					var mins = totalTime % 60;
					console.log("total sleep time : " + hours +" : " + mins);
					time.push(hours);
					time.push(mins);

					return time[idx];
				}

				//Math.floor((this.distance.today / this.goals.distance ) * 100);
				//icon-data part
				//var iconBasePoint = 3.5; >> x + r = select('#distance-circle').getBBox.cx
				//var iconEndPoint = 29.5;

				$scope.countWidthByIcon = function (efficency) {
					//var iconWidth = iconEndPoint - iconBasePoint;
					var iconWidth = 25;
					var width = (efficency * iconWidth ) / 100;
					console.log("count icon width: " + width);
					return width;
				}

				//var canvas =Snap("#svgDistance");
				//debugger;
				//var distanceCircle = canvas.select('#distance-circle');
				//var thisCircle = distanceCircle.getBBox();
				//console.log(thisCircle);

				//var tmp = d3.select("#svgDistance");
				//console.log(tmp);


				//water of body part
				var bodyDownPoint = 700;
				var bodyUpPoint = 110;
				function countWidthByBody(efficency) {
					var bodyWidth = bodyDownPoint - bodyUpPoint;
					var height = (efficency * bodyWidth) /100;
					console.log("count water of body height: " + height);
					return height;
				}


				//set data object index
				$scope.indexOfTarget = {};
				var targetsName = ['totalTimeInBed', 'totalMinutesAsleep' , 'restingHeartRate','water', 'foodPlan' , 'estimatedCaloriesOut' , 'logWeight', 'calories', 'steps' , 'activityCalories' , 'floors' , 'distance' ];
				//$scope.targets[$scope.indexOfTarget.water]
				angular.forEach(targetsName, function(element, idx){
					$scope.indexOfTarget[element] = idx;
				});

				//1.Using BMR
				//Formula 9.99 * weightKg + 6.25*heightCm - 4.92*ageYears + s, where s is +5 for males and -161 for female
				//2.
				// GET  https://api.fitbit.com/1/user/[user-id]/activities/date/[date].json
				//res[summary].veryActiveMinutes
				//3.
				// value of
				// activityCalories convert value of veryActiveMinutes roughly
				//ex) activityCalories(102) /dividedByBMR(11) = veryActiveMinutes(93)
				var dividedByBMR = 11;

				//$scope.svgIconCanvasSize = "M" + 0 +',' + 0 + 'v' + 50 + 'h' + 40 + 'V'+ 0 + 'H' + 0 + 'z';

				$scope.svgIconCanvasSize = 'M0,0v50h40V0H0z';
				$scope.svgIconMaskSize = 'M1,1v48h38V1H1z';
				//data-binding not working in ie
				//$scope.svgIconCanvasSize = {
				//	'M' : [0, 0],
				//	'v' : 50,
				//	'h' : 40,
				//	'V' : 0,
				//	'H' : 0
				//};

				//all data
				$scope.targets = [
					{
						"display" : "수면시간",
						"name" : "totalTimeInBed",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-totalTimeInBed.svg",
						"efficiency" : parseInt(($scope.sleepData.timeInBed.today * 100 ) / $scope.sleepData.goal)
					},
					{
						"display" : "꿀잠",
						"name" : "totalMinutesAsleep",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-totalMinutesAsleep.svg",
						"efficiency" : $scope.sleepData.efficiency.today

					},
					{
						"display" : "심박수 측정",
						"name" : "restingHeartRate",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-restingHeartRate.svg",

					},
					{
						"display" : "물마시기",
						"name" : "water",
						"color" : "#512b8d",
						"src" : "/assets/images/icon-svg/icon-water.svg",
						"efficiency" : parseInt(($scope.waterData.today * 100 ) / $scope.waterData.goal)

					},
					{
						"display" : "건강한 식단",
						"name" : "foodPlan",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-foodPlan.svg",
						"efficiency" : 90
					},
					{
						"display" : "음식계획",
						"name" : "estimatedCaloriesOut",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-estimatedCaloriesOut.svg",
						"efficiency" : 100
					},
					{
						"display" : "체중 측정",
						"name" : "logWeight",
						"color" : "#fab657",
						"src" : "/assets/images/icon-svg/icon-logWeight.svg",
						"efficiency" : 70
					},
					{
						"display" : "칼로리 소비",
						"name" : "calories",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-calories.svg",
						"efficiency" : parseInt(($scope.activityData.calories.today  * 100 ) / $scope.activityData.goals.caloriesOut)
					},
					{
						"display" : "걸음수",
						"name" : "steps",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-steps.svg",
						"efficiency" : parseInt(($scope.activityData.steps.today  * 100 ) / $scope.activityData.goals.steps)
					},


				{
						"display" : "활동적 시간",
						"name" : "activityCalories",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-activityCalories.svg",
						"efficiency" : parseInt((($scope.activityData.activityCalories.today / dividedByBMR)  * 100 ) / $scope.activityData.goals.activeMinutes)
					},
					{
						"display" : "층수",
						"name" : "floors",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-floors.svg",
						"efficiency" : parseInt(($scope.activityData.floors.today  * 100 ) / $scope.activityData.goals.floors)
					},
					{
						"display" : "이동 거리",
						"name" : "distance",
						"color" : "#f74d52",
						"src" : "/assets/images/icon-svg/icon-distance.svg",
						"efficiency" : parseInt(($scope.activityData.distance.today  * 100 ) / $scope.activityData.goals.distance)
					}
				];

				if(($scope.heart.restingHeartRate[0] ===  null) || ($scope.heart.restingHeartRate[0] === "0") || ($scope.heart.restingHeartRate[0] === "")) {
					$scope.targets[$scope.indexOfTarget.restingHeartRate]["efficiency"] = 0;
				} else {
					$scope.targets[$scope.indexOfTarget.restingHeartRate]["efficiency"] =  100;
				}

				$scope.targetsRange = [
					{
						//"name" : "totalTimeInBed",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.totalTimeInBed].efficiency)
					},
					{
						//"name" : "totalMinutesAsleep",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.totalMinutesAsleep].efficiency)
					},
					{
						//"name" : "restingHeartRate",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.restingHeartRate].efficiency)
					},
					{
						//"name" : "water",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.water].efficiency),
						"bodyRatio" : countWidthByBody($scope.targets[$scope.indexOfTarget.water].efficiency)
					},
					{
						//"name" : "foodPlan",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.foodPlan].efficiency)
					},
					{
						//"name" : "estimatedCaloriesOut",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.estimatedCaloriesOut].efficiency)
					},
					{
						//"name" : "logWeight",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.logWeight].efficiency)
					},
					{
						//"name" : "calories",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.calories].efficiency)
					},
					{
						//"name" : "steps",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.steps].efficiency)
					},
					{
						//"name" : "activityCalories",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.activityCalories].efficiency)
					},
					{
						//"name" : "floors",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.floors].efficiency)
					},
					{
						//"name" : "distance",
						"iconRatio" : $scope.countWidthByIcon($scope.targets[$scope.indexOfTarget.distance].efficiency)
					}
				];

				//get index of $scope.targets
				$scope.filterSearch = function (filterTarget) {
					$filter("filter")($scope.targets, function(ele, idx) {
						if(ele.name === filterTarget ) return idx;
						else return false;
					});
				};

				//enegetic part data
				$scope.todayStatus = {
					"totalTimeInBed" : 50,
					"totalMinutesAsleep" :73,
					"restingHeartRate" : 100,
					"water" : 63,
					"calories" : 26,
					"steps" : 41,
					"activityCalories" : 103,
					"floors" : 35,
					"distance" : 65
				};



				function countStatusByPercent(all, percentage, flag) {
					if(flag === false) {
						return parseFloat((all * percentage) / 100).toFixed(2) ;
					} else {
						return parseInt((all * percentage) / 100 );
					}
				}

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

				$scope.dataCals = {
					"ranges": [$scope.activityData.goals.caloriesOut, $scope.activityData.calories.lastWeek === 0 ? 1552 : $scope.activityData.calories.lastWeek ],
					"measures": [$scope.activityData.calories.today === 0 ? countStatusByPercent($scope.activityData.goals.caloriesOut, $scope.todayStatus.calories) : $scope.activityData.calories.today ],
					"markers": [$scope.activityData.calories.yesterday === 0 ? 1300 : $scope.activityData.calories.yesterday]
				};

				//Steps
				$scope.dataSteps = {
					"ranges": [$scope.activityData.goals.steps, $scope.activityData.steps.lastWeek === 0 ? 4155 : $scope.activityData.steps.lastWeek],
					"measures": [$scope.activityData.steps.today === 0 ? countStatusByPercent($scope.activityData.goals.steps, $scope.todayStatus.steps) : $scope.activityData.steps.today],
					"markers": [$scope.activityData.steps.yesterday === 0 ? 8888 : $scope.activityData.steps.yesterday]
				};

				//ActivityCalories
				$scope.dataActivityCalories = {
					"ranges": [$scope.activityData.goals.activeMinutes, $scope.activityData.activityCalories.lastWeek === 0 ? 17 : parseFloat(($scope.activityData.activityCalories.lastWeek)/ dividedByBMR).toFixed(1)],
					"measures": [$scope.activityData.activityCalories.today === 0 ? countStatusByPercent($scope.activityData.goals.activeMinutes, $scope.todayStatus.activityCalories ) : parseFloat($scope.activityData.activityCalories.today / dividedByBMR).toFixed(1)],
					"markers": [$scope.activityData.activityCalories.yesterday === 0 ? 12 : parseFloat(($scope.activityData.activityCalories.yesterday)/dividedByBMR).toFixed(1)]
				};

				//Floors
				$scope.dataFloors = {
					"ranges": [$scope.activityData.goals.floors, $scope.activityData.floors.lastWeek === 0 ? 8 : $scope.activityData.floors.lastWeek],
					"measures": [$scope.activityData.floors.today === 0 ? countStatusByPercent($scope.activityData.goals.floors, $scope.todayStatus.floors) : $scope.activityData.floors.today],
					"markers": [$scope.activityData.floors.yesterday === 0 ? 5 : $scope.activityData.floors.yesterday]
				};

				//Distance
				$scope.dataDistance = {
					"ranges": [$scope.activityData.goals.distance, $scope.activityData.distance.lastWeek === 0 ? 5.04 : $scope.activityData.distance.lastWeek],
					"measures": [$scope.activityData.distance.today === 0 ? countStatusByPercent($scope.activityData.goals.distance, $scope.todayStatus.distance, false) : $scope.activityData.distance.today],
					"markers": [$scope.activityData.distance.yesterday === 0 ? 6.5 : $scope.activityData.distance.yesterday]
				};

			}
		}
	}
})();