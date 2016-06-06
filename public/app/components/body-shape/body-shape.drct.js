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
						height:600,
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
					$scope.head = body.select('#b-sync-head');

					$scope.leftArms = body.select('#b-sync-left-arm');
					$scope.rightArms = body.select('#b-sync-right-arm');

					$scope.bottom = body.select('#b-sync-bottom');
					$scope.bottomOutline = body.select('#b-sync-layer-line');

					$scope.top = body.select('#b-sync-top');
					$scope.neck = body.select('#b-sync-neck');

					$scope.head = body.select('#bg-head');
					$scope.headOutline = body.select('#bg-head #outline');
					$scope.refreshHead = body.select('#refresh-head rect');

					$scope.points = body.select('#points');
					$scope.restingHeartRatePoints = body.select('#basePoint-restingHeartRate');
					$scope.foodPlanPoints = body.select('#basePoint-foodPlan');
					$scope.estimatedCaloriesOutpPoints = body.select('#basePoint-estimatedCaloriesOut');
					$scope.caloriesPoints = body.select('#basePoint-calories');
					$scope.stepsPoints = body.select('#basePoint-steps');
					$scope.activityCaloriesPoints = body.select('#basePoint-activityCalories');
					$scope.floorsPoints = body.select('#basePoint-floors');
					$scope.distancePoints = body.select('#basePoint-distance');

					$scope.logWeightBtn = body.select('#add-btn-logWeight');

					//$scope.animating = false;

					// on load, first reset the paths
					$scope.reset = function() {
						$scope.refreshHead.transform("s0,0");
						bodyShape.forEach(function (el) {
							console.log("body of svg is sycn");
							el.append(body);
						});
					};

					$scope.reset();

				});

				//var syncBtn = angular.element(document.querySelector("#body-container button span"));
				//console.log(syncBtn);
				$scope.isSync = false;
				$scope.syncBtnText = [
					'클릭! 가상으로 데이터 씽크',
					'데이터 씽크 이전으로 클릭!'
				];

				function headSync(delay, length){
					//$scope.animating = true;
					$scope.head.animate({
						fill : "#F0F0F0"
					}, length , mina.easeinout);
				};

				function animateSync() {
					headSync(0, 500);
				}

				$scope.doSync = function () {
					$scope.isSync = !$scope.isSync;
					$scope.syncBtn = $scope.isSync ? $scope.syncBtnText[1] : $scope.syncBtnText[0];

					if($scope.isSync) {
						animateSync();

					} else {
						$scope.reset();
					}

				};

				//$scope.$watch('isSync', function (){
				//})

				//syncBtn.click(function () {
				//	if($scope.isSync === true) {
				//
				//	} else {
				//
				//	}
				//});

			}
		}
	}
})();
