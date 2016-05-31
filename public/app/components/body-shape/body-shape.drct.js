/**
 * Created by tmin_lim on 16. 4. 22..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('bodyShape', BodyShape);

	BodyShape.$inject = ['dataAPI'];

	function BodyShape(dataAPI) {
		console.log('directive bodyShape in');
		return {
			templateUrl: '/app/components/body-shape/body-shape.html',
			restrict: 'E',
			controller: function($scope) {
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;

				$scope.verticalOptions = {
					chart: {
						type: 'bulletChart',
						transitionDuration: 500,
						height:300,
						width:10,
						margin : {
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						},
						showXAxis:"false",
						orient:"bottom",
						showYAxis:"false",
						interactive:"true",
						tooltips:"true",
						vertical:"true"
					}
				};
				//> db.nutritions.find().pretty()
				//{
				//	"_id" : ObjectId("57144bd9bec98272073ad078"),
				//	"weekAgoToday" : 0,
				//	"yesterday" : 0,
				//	"today" : 0,
				//	"lastWeek" : 0,
				//	"goal" : 1893,
				//	"__v" : 0
				//}
				$scope.dataWater = {
					"ranges": [1893, 1000, 0],
					"measures": [800],
					"markers": [1700]
				};
			}
		}
	}
})();
