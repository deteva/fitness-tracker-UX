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
				//$scope.heart = $scope.heartrateData;
				//$scope.friend = $scope.friendData.no3;

				//date
				var today = moment().format('MMM Do');
				$scope.today = today;
				var yesterday = moment().subtract(1, 'days').format('MMM Do');
				var nYesterday = moment().subtract(1, 'days').format('Do');
				var sWeekAgoDay = moment().subtract(7, 'days').format('dddd');
				var sWeekAgoToday = moment().subtract(7, 'days').format('MMM Do');
				var weekAgoToday = moment().subtract(7, 'days').format('MMM Do dddd');
				var nWeekAgoToday = moment().subtract(7, 'days').format('MMM D');
				var nLastWeek = nWeekAgoToday + ' ~ ' + nYesterday;

				console.log("오늘 " + today);
				console.log("어제 " + yesterday);
				console.log("지난주 " + sWeekAgoDay +' ' + sWeekAgoToday);
				console.log("지난 주간 " + nLastWeek);

				$scope.selectedDates = [
					{label: "어제", date: yesterday},
					{label: "지난주 " + sWeekAgoDay, date: sWeekAgoToday},
					{label: "지난주 평균", date: nLastWeek}
				];
				$scope.printDate = function() {
					return this.selectedDate.date;
				};

				//autocompelte
				$scope.isAchievementDisabled1 = true;
				$scope.isAchievementDisabled2 = true;
				$scope.isAchievementDisabled3 = true;

				$scope.ableSelectAcheivement1 = function() {
					//case1 not working
					// var tmpisAchievementDisabled = "isAchievementDisabled" + num;
					//console.log("tmpisAchievementDisabled: " +  tmpisAchievementDisabled);
					//if($scope.isAchievementDisabled1)
					//	$scope.tmpisAchievementDisabled = false;
					//if($scope.selectedTarget == null)
					//	$scope.tmpisAchievementDisabled = true;
					//not working : typeof tmpisAchievementDisabled string
					if($scope.isAchievementDisabled1)
						$scope.isAchievementDisabled1 = false;
					if($scope.selectedTarget == null)
						$scope.isAchievementDisabled1 = true;
					//case1 not working setAttrbute temporary
					//var tmp = document.querySelector("input[name='autocompleteField-acheivement']")
					// tmp.setAttribute('disabled', 'disabled');
				};

				$scope.ableSelectAcheivement2 = function() {
					if($scope.isAchievementDisabled2)
						$scope.isAchievementDisabled2 = false;
					if($scope.selectedTarget2 == null)
						$scope.isAchievementDisabled2 = true;
				};

				$scope.ableSelectAcheivement3 = function() {
					if($scope.isAchievementDisabled3)
						$scope.isAchievementDisabled3 = false;
					if($scope.selectedTarget3 == null)
						$scope.isAchievementDisabled3 = true;
				};

				$scope.targets = [
					{
						"display" : "수면시간",
						"name" : "totalTimeInBed",
						"src" : "/assets/images/icon-svg/icon-totalTimeInBed.svg"
					},
					{
						"display" : "꿀잠",
						"name" : "totalMinutesAsleep",
						"src" : "/assets/images/icon-svg/icon-totalMinutesAsleep.svg"
					},
					{
						"display" : "심박수 측정",
						"name" : "restingHeartRate",
						"src" : "/assets/images/icon-svg/icon-restingHeartRate.svg"
					},
					{
						"display" : "물마시기",
						"name" : "water",
						"src" : "/assets/images/icon-svg/icon-water.svg"
					},
					{
						"display" : "건강한 식단",
						"name" : "foodPlan",
						"src" : "/assets/images/icon-svg/icon-foodPlan.svg"
					},
					{
						"display" : "음식계획",
						"name" : "estimatedCaloriesOut",
						"src" : "/assets/images/icon-svg/icon-estimatedCaloriesOut.svg"
					},
					{
						"display" : "몸무게 확인",
						"name" : "logWeight",
						"src" : "/assets/images/icon-svg/icon-logWeight.svg"
					},
					{
						"display" : "칼로리 소비",
						"name" : "calories",
						"src" : "/assets/images/icon-svg/icon-calories.svg"
					},
					{
						"display" : "걸음수",
						"name" : "steps",
						"src" : "/assets/images/icon-svg/icon-steps.svg"
					},
					{
						"display" : "활동적 시간",
						"name" : "activityCalories",
						"src" : "/assets/images/icon-svg/icon-activityCalories.svg"
					},
					{
						"display" : "층수",
						"name" : "floors",
						"src" : "/assets/images/icon-svg/icon-floors.svg"
					},
					{
						"display" : "이동 거리",
						"name" : "distance",
						"src" : "/assets/images/icon-svg/icon-distance.svg"
					}
				];


				$scope.achievement = [
					{
						"percent" : "100% 달성",
						"number" : 100
					},
					{
						"percent" : "90% 달성",
						"number" : 90
					},
					{
						"percent" : "80% 달성",
						"number" : 80
					},
					{
						"percent" : "70% 달성",
						"number" : 70
					},					{
						"percent" : "60% 달성",
						"number" : 60
					},
					{
						"percent" : "50% 달성",
						"number" : 50
					},					{
						"percent" : "40% 달성",
						"number" : 40
					},
					{
						"percent" : "20% 달성",
						"number" : 20
					},					{
						"percent" : "30% 달성",
						"number" : 30
					},					{
						"percent" : "20% 달성",
						"number" : 20
					},
					{
						"percent" : "10% 달성",
						"number" : 10
					}];


				//background: url(../../images/target.png) >> ng-style
				//$scope.getBackgroundStyle = function(selectedTarget){
				//	return {
				//		'background-image':'url(../../images/' + selectedTarget + '.png)'
				//	}
				//}
			}
		}
	}
})();
