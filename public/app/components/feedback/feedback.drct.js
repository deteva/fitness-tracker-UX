/**
 * Created by tmin_lim on 16. 4. 25..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('feedback', FeedBack)
		.directive('ngFill', function () {
			return function(scope, element, attrs) {
				scope.$watch(attrs.ngFill, function(value) {
					element.attr('fill', value);
				});
			};
		});

	FeedBack.$inject = ['dataAPI', '$filter'];

	function FeedBack(dataAPI, $filter) {
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

				//toggle text of button
				$scope.toggleBtnObj = [
					{
						"set" : {
							"txt": "오늘의 미션 등록",
							"src": "/assets/images/select-dark.png"
						}
					},
					{
						"start" : {
							"txt" : "시작! 오늘은 챔피언 ",
							"src" : "/assets/images/reward-medium.png"
						}
					},
					{
						"finished" : {
							"txt" : "성공했어요! 당신은 챔피언",
							"src" : "/assets/images/takeReward.png"
						}
					}
				];

				$scope.ableToggleTxt = true;
				$scope.initToggleBtnText = $scope.toggleBtnObj[0].set.txt;
				$scope.initToggleImgSrc = $scope.toggleBtnObj[0].set.src

				$scope.$watch('ableToggleTxt', function () {
					$scope.toggleBtnText = $scope.ableToggleTxt ? $scope.toggleBtnObj[1].start.txt : $scope.toggleBtnObj[2].finished.txt;
					$scope.toggleImgSrc = $scope.ableToggleTxt ? $scope.toggleBtnObj[1].start.src : $scope.toggleBtnObj[2].finished.src;
				});

				//get count of all error categories from form
				//$scope.numberOfErrors = function(form){
				//	var count = 0,
				//		 errors = form.$error;
				//	angular.forEach(errors, function(val){
				//		if(angular.isArray(val)) {
				//			count += val.length;
				//		}
				//	});
				//	//Object.keys(errors).forEach(function(key){ count += errors[key].length  });
				//	return count;
				//};


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

				//feedback data not using algorithms but just insert data
				//sample improvement-points
				var firstImprovementObj= $scope.targets[$scope.indexOfTarget.totalMinutesAsleep];
				var sndImprovementObj= $scope.targets[$scope.indexOfTarget.estimatedCaloriesOut];
				var trdImprovementObj= $scope.targets[$scope.indexOfTarget.steps];

				//sample strong-points
				var firstStrongObj= $scope.targets[$scope.indexOfTarget.water];
				var sndStrongObj= $scope.targets[$scope.indexOfTarget.logWeight];
				var trdStrongObj= $scope.targets[$scope.indexOfTarget.floors];

				$scope.feedbackList = {
					"improvement" : [
						{
							"name" : firstImprovementObj.name,
							"party" : firstImprovementObj.color,
							"target" : firstImprovementObj.display,
							"desc" : "2시간 5분 꿀잠"
						},
						{
							"name" : sndImprovementObj.name,
							"party" : sndImprovementObj.color,
							"target" : sndImprovementObj.display,
							"desc" : "3,641 섭취 > 1,124"
						}
						,
						{
							"name" : trdImprovementObj.name,
							"party" : trdImprovementObj.color,
							"target" : trdImprovementObj.display,
							"desc" : "4,365 / 10,000"
						}
					],
					"strong" : [
						{
							"name" : firstStrongObj.name,
							"party" : firstStrongObj.color,
							"target" : firstStrongObj.display,
							"desc" : "3200ml"
						},
						{
							"name" : sndStrongObj.name,
							"party" : sndStrongObj.color,
							"target" : sndStrongObj.display,
							"desc" : "최근 - 0.8kg"
						}
						,
						{
							"name" : trdStrongObj.name,
							"party" : trdStrongObj.color,
							"target" : trdStrongObj.display,
							"desc" : "23 / 10층"
						}
					]
				};





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
