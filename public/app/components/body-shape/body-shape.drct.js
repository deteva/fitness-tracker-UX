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

				//add water
				$scope.verticalOptions = {
					chart: {
						type: 'bulletChart',
						transitionDuration: 500,
						height:610,
						width:20,
						margin : {
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						},
						showXAxis:"false",
						orient:"top",
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
					"markers": [800]
				};
			//attach body svg
				var bodyShape = Snap.selectAll('.body-container');
				console.log(bodyShape);
				//load svg file
				Snap.load('/assets/images/body-svg/beforeSyncBody.svg', function (body) {
					var head = body.select('#b-sync-head'),

						 leftArms = body.select('#b-sync-left-arm'),
						 rightArms = body.select('#b-sync-right-arm'),

						 bottom = body.select('#b-sync-bottom'),
						 bottomOutline = body.select('#b-sync-layer-line'),

						 top = body.select('#b-sync-top'),
						 neck = body.select('#b-sync-neck'),

					 	 head = body.select('#bg-head'),
						 headOutline = body.select('#bg-head #outline'),
						 refreshHead = body.select('#refresh-head rect.st10'),

						 points = body.select('#points'),
						 restingHeartRatePoints = body.select('#basePoint-restingHeartRate'),
						 foodPlanPoints = body.select('#basePoint-foodPlan'),
						 estimatedCaloriesOutpPoints = body.select('#basePoint-estimatedCaloriesOut'),
						 caloriesPoints = body.select('#basePoint-calories'),
						 stepsPoints = body.select('#basePoint-steps'),
						 activityCaloriesPoints = body.select('#basePoint-activityCalories'),
						 floorsPoints = body.select('#basePoint-floors'),
						 distancePoints = body.select('#basePoint-distance'),

						 logWeightBtn = body.select('#add-btn-logWeight'),

						 animating = false;

					function reset () {
						refreshHead.transform("s0,0");
					}

					// on load, first reset the paths
					reset();
					bodyShape.forEach(function (el) {
						console.log("body of svg is sycn");
						el.append(body);
					});






				})

			}
		}
	}
})();
