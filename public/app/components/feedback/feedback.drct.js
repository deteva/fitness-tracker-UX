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
				var today = moment().format('MMM Do dddd');
				var yesterday = moment().subtract(1, 'days').format('MMM Do');
				var nYesterday = moment().subtract(1, 'days').format('Do');
				var sWeekAgoToday = moment().subtract(7, 'days').format('dddd');
				var weekAgoToday = moment().subtract(7, 'days').format('MMM Do dddd');
				var nWeekAgoToday = moment().subtract(7, 'days').format('MMM Do');
				var nLastWeek = nWeekAgoToday + '~' + nYesterday;

				console.log("오늘 " + today);
				console.log("어제 " + yesterday);
				console.log("지난주 " + sWeekAgoToday +' ' + nWeekAgoToday);
				console.log("지난 주간 " + nLastWeek);

				$scope.selectedDates = [
					{label: "어제", date: yesterday},
					{label: "지난주 " + sWeekAgoToday, date: nWeekAgoToday},
					{label: "지난주 평균", date: nLastWeek}
				];
				//$scope.selectedDate = null;
				//$scope.selectedDates = null;
				//$scope.onDate = function() {
				//	return $scope.selectedDates = [
				//		{label: "어제", date: yesterday},
				//		{label: "지난주 " + sWeekAgoToday, date: nWeekAgoToday},
				//		{label: "지난주 평균", date: nLastWeek}
				//	]
				//};
				$scope.printDate = function() {
					return this.selectedDate.date;
				};

			}
		}
	}
})();

//<md-select ng-model="selectedDate" placeholder="어제" ng-change=""
//md-on-open="onDate()">
//	<md-option ng-value="selectedDate" ng-repeat="selectedDate in selectedDates">{{selectedDate.number}}</md-option>
//<!--<md-option value="0">어제</md-option>-->
//	<!--<md-option value="1">지난 주 평균</md-option>-->
//</md-select>