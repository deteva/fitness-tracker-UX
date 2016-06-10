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
						height:530,
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

					$scope.arms = body.select('#b-sync-arms');
					$scope.leftArm = body.select('#b-sync-left-arm');
					$scope.rightArm = body.select('#b-sync-right-arm');

					$scope.bottom = body.select('#b-sync-bottom');
					$scope.bottomOutline = body.select('#b-sync-bottom-line');
					$scope.leftAnkle = body.select('#b-sync-ankle-left');
					$scope.rightAnkle = body.select('#b-sync-angkle-right');

					$scope.top = body.select('#b-sync-top');
					$scope.neck = body.select('#b-sync-neck');

					$scope.head = body.select('#bg-head');
					$scope.headOutline = body.select('#b-sync-head #outline');
					$scope.refreshHead = body.select('#refresh-head rect');

					$scope.points = body.select('#points');
					$scope.restingHeartRatePoint = body.select('#basePoint-restingHeartRate');
					$scope.foodPlanPoint = body.select('#basePoint-foodPlan');
					$scope.estimatedCaloriesOutpPoint = body.select('#basePoint-estimatedCaloriesOut');
					$scope.caloriesPoint = body.select('#basePoint-calories');
					$scope.stepsPoint = body.select('#basePoint-steps');
					$scope.activityCaloriesPoint = body.select('#basePoint-activityCalories');
					$scope.floorsPoint = body.select('#basePoint-floors');
					$scope.distancePoint = body.select('#basePoint-distance');

					$scope.logWeightBtn = body.select('#add-btn-logWeight');

					$scope.svgBody = body.select('#all');


					//$scope.animating = false;

					// on load, first reset the paths
					$scope.reset = function() {
						//$scope.refreshHead.transform("s0,0");
						bodyShape.forEach(function (el) {
							console.log("body of svg is sycn");
							el.append(body);
						});
					};

					$scope.reset();

					var hoverIn = function bodyHover(){
						if(!$scope.isSync) {
							return;
						} else {
							console.log('hover in event');
						};
					};

					var hoverOut = function bodyHoverOut() {
						if(!$scope.isSync) {
							return;
						} else {
							console.log('hover out event');
						};
					};

					$scope.svgBody.hover(hoverIn, hoverOut);


				});


				//var syncBtn = angular.element(document.querySelector("#body-container button span"));
				//console.log(syncBtn);

				$scope.isSync = false;
				$scope.syncBtnText = [
					'클릭! 가상으로 데이터 씽크',
					'데이터 씽크 이전으로 클릭!'
				];

				function headSync(delay, length){
					//$scope.head.toggleClass('color-bg-grey color-medium-grey');
					if($scope.isSync) {
						//head part
						$scope.head.animate({
							fill : "#F0F0F0"
						}, length , mina.easeinout);

						$scope.headOutline.animate({
							fill : "#C0C3C5"
						}, length , mina.easeinout, function (){
							$scope.refreshHead.animate({
								height : "55"
							}, length - 100, mina.elastic);

						});

						//top part
						$scope.top.animate({
							d:"M109,296.6h61.7l-3.5-90l31.1-14.8l-11.1-48.2c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l-2.9,90H109z"
						}, length , mina.easeinout, function() {
							$scope.top.toggleClass('stroke-dash7');
							$scope.top.addClass('noneStroke-dash7');
							$scope.neck.toggleClass('stroke-dash7');
							$scope.neck.addClass('noneStroke-dash7');
							$scope.arms.toggleClass('stroke-dash7');
							$scope.arms.addClass('noneStroke-dash7');

							$scope.leftArm.animate({
								transform : 'r-2.5,' + $scope.leftArm.getBBox().x + ', ' + $scope.leftArm.getBBox().y + ''
							}, length + 300, mina.easein);

							$scope.rightArm.animate({
								transform : 'r2.5,' + $scope.rightArm.getBBox().x + ', ' + $scope.rightArm.getBBox().y + ''
							}, length + 300, mina.easein);

						});

						//top part point
						$scope.estimatedCaloriesOutpPoint.animate({
							transform : 't17.5 0'
						}, length, mina.easeinout);


					} else {
						//head part
						$scope.head.animate({
							fill : "#C0C3C5"
						}, length - 200 , mina.easeinout, function (){
							$scope.refreshHead.animate({
								height: "5"
								//transform : "s0,0"
							}, length - 400, mina.easeout);
						});

						$scope.headOutline.animate({
							fill : "#f0f0f0"
						}, length - 200 , mina.easeinout);

						//top part
						$scope.top.animate({
							d:"M109,296h44.7l13.6-90l31.1-14.8L187.2,143c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l13.6,90H109z"
						}, length - 200 , mina.easeinout, function() {
							$scope.top.removeClass('noneStroke-dash7');
							$scope.top.toggleClass('stroke-dash7');
							$scope.neck.removeClass('noneStroke-dash7');
							$scope.neck.toggleClass('stroke-dash7');
							$scope.arms.removeClass('noneStroke-dash7');
							$scope.arms.toggleClass('stroke-dash7');

							$scope.leftArm.animate({
								transform : 'r0.5,' + $scope.leftArm.getBBox().x + ', ' + $scope.leftArm.getBBox().y + ''
							}, length, mina.easein);

							$scope.rightArm.animate({
								transform : 'r-0.5,' + $scope.rightArm.getBBox().x + ', ' + $scope.rightArm.getBBox().y + ''
							}, length, mina.easein);
						});

						//top part point
						$scope.estimatedCaloriesOutpPoint.animate({
							transform :$scope.estimatedCaloriesOutpPoint.getBBox().cx + ", " + $scope.estimatedCaloriesOutpPoint.getBBox().cy   + "t-17.5 0"
						}, length - 200, mina.easeinout);
					}

				};


				function bottomSync(delay, length){
					setTimeout(function(){
						if($scope.isSync) {
							$scope.bottom.animate({
								d:"M108.8,295.8H48c0,0-3.9,46.7-6.5,84.2c-2.8,41.4-14,255.5-20,302.6l29,0.2L7.3,715.7 l68.3-12.1l0-19c0,0,25.1-1.6,29.1-2c0,0,0.6-273.7,1.5-303.9h5.2c0.9,30.2,0.7,304.2,0.7,304.2c9,0.6,23,0.7,29.9,0.7l0,20" +
								" l68.3,12.1l-43.9-33.6l29.8-1.5c-3.7-66.6-16.8-246.3-20.7-303.4c-2.2-32.9-5.3-81.4-5.3-81.4H108.8"
								}, length , mina.easeinout, function () {
								$scope.bottom.toggleClass('stroke-dash7');
								$scope.bottom.addClass('noneStroke-dash7');
								$scope.bottomOutline.toggleClass('stroke-dash7');
								$scope.bottomOutline.addClass('noneStroke-dash7');
							});

							$scope.leftAnkle.animate({
								x1:"51.1",
								y1:"682.1",
								x2:"78.5",
								y2:"682.8"
							}, length , mina.easeinout);

							$scope.rightAnkle.animate({
								x1:"170",
								y1:"681.1",
								x2:"135.5",
								y2:"681.9"
							}, length , mina.easeinout);

							//bottom part point
							$scope.caloriesPoint.animate({
								transform : 't-3.5 0.5'
							}, length, mina.easeinout);

							$scope.stepsPoint.animate({
								transform : 't15.5 0.5'
							}, length, mina.easeinout);

							$scope.activityCaloriesPoint.animate({
								transform : 't-14.5 0'
							}, length, mina.easeinout);

							$scope.floorsPoint.animate({
								transform : 't30.5 4.5'
							}, length, mina.easeinout);

							$scope.distancePoint.animate({
								transform : 't-31.5 -1.5'
							}, length, mina.easeinout);

						} else {
							$scope.bottom.animate({
								d:"M109,296H64.3c0,0-14.1,20.4-23.3,60.7c-9.3,40.3-3.7,103.4,8.3,148.9l5.1,172L7.6,715.2 l68.2-12.1v-19c0,0,17.2-165.5,17.2-175.1c0,0,12.5-102.2,13.4-132.4h5.2C112.5,406.7,125,509,125,509 c0,9.5,17.2,175.1,17.2,175.1v19l68.2,12.1l-46.8-37.6l5.1-172c12.1-45.4,17.6-108.5,8.3-148.9c-9.3-40.3-23.3-60.7-23.3-60.7H109"
							}, length , mina.easeinout, function () {
								$scope.bottom.removeClass('noneStroke-dash7');
								$scope.bottom.toggleClass('stroke-dash7');
								$scope.bottomOutline.removeClass('noneStroke-dash7');
								$scope.bottomOutline.toggleClass('stroke-dash7');

							})

							$scope.leftAnkle.animate({
								x1:"54.5",
								y1:"677.6",
								x2:"75.8",
								y2:"684.1"
							}, length , mina.easeinout);

							$scope.rightAnkle.animate({
								x1:"163.5",
								y1:"677.6",
								x2:"142.2",
								y2:"684.1"
							}, length , mina.easeinout);
						}

						//bottom part point
						$scope.caloriesPoint.animate({
							transform :$scope.caloriesPoint.getBBox().cx + ", " + $scope.caloriesPoint.getBBox().cy   + "t3.5 -0.5"
						}, length - 100, mina.easeinout);

						$scope.stepsPoint.animate({
							transform :$scope.stepsPoint.getBBox().cx + ", " + $scope.stepsPoint.getBBox().cy   + "t-15.5 -0.5"
						}, length - 100, mina.easeinout);

						$scope.activityCaloriesPoint.animate({
							transform :$scope.activityCaloriesPoint.getBBox().cx + ", " + $scope.activityCaloriesPoint.getBBox().cy   + "t14.5 0"
						}, length - 100, mina.easeinout);

						$scope.floorsPoint.animate({
							transform :$scope.floorsPoint.getBBox().cx + ", " + $scope.floorsPoint.getBBox().cy   + "t-30.5 -4.5"
						}, length - 100, mina.easeinout);

						$scope.distancePoint.animate({
							transform :$scope.floorsPoint.getBBox().cx + ", " + $scope.floorsPoint.getBBox().cy   + "t31.5 1.5"
						}, length - 100, mina.easeinout);


					}, delay);
				}

				function animateSync() {
					headSync(0, 500);
					bottomSync(200, 200);
				}

				$scope.doSync = function () {
					$scope.isSync = !$scope.isSync;
					$scope.syncBtn = $scope.isSync ? $scope.syncBtnText[1] : $scope.syncBtnText[0];
					animateSync();
					//if($scope.isSync) {
					//	animateSync();
					//
					//} else {
					//	$scope.reset();
					//}
				};

				//var svgBody = document.querySelector("#body");
				//
				//svgBody.hover(hoverIn, hoverOut);




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
