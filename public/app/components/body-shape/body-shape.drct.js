/**
 * Created by tmin_lim on 16. 4. 22..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('bodyShape', BodyShape)
		.directive('setClassWhenAtTop', function ($window) {
			var $win = angular.element($window);

			return {
				restrict: 'A',
				link: function (scope, element, attrs) {

					function offset(elm) {
						try {return elm.offset();} catch(e) {}
						var rawDom = elm[0];
						var _x = 0;
						var _y = 0;
						var body = document.documentElement || document.body;
						var scrollX = window.pageXOffset || body.scrollLeft;
						var scrollY = window.pageYOffset || body.scrollTop;
						_x = rawDom.getBoundingClientRect().left + scrollX;
						_y = rawDom.getBoundingClientRect().top + scrollY;
						return { left: _x, top: _y };
					}

					scope.getWindowDimensions = function () {
						return {
							'h': $win[0].innerHeight,
							'w': $win[0].innerWidth
						};
					};

					scope.windowTopPoint = 80;

					$win.on('scroll', function (e) {
						//for debugging
						var offsetTop = offset(element).top;
						var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

						console.log(e);
						console.log(e.srcElement.activeElement);
						console.log("document.body.scrollTop: " + top );
						console.log("offsetTop: " + offsetTop);

						if(e.srcElement.activeElement.nodeName.toLowerCase()  === 'body'){
							//element.removeClass('absTopPos');

							if(scope.getWindowDimensions().w < 960) {
								followByScroll(440);
								console.log('getWindowDimensions width is smaller than 960px');
							}
							else
								followByScroll(350);
						} else {
							element.addClass('absTopPos');
							return;
						}


						function followByScroll(windowReachPoint) {
							if(top < scope.windowTopPoint && top >= 0) {
								element.removeClass('fixToTop');
							} else if (top <= windowReachPoint && top >= scope.windowTopPoint ) {
								element.removeClass('absTopPos');
								element.addClass('followTop');
								element.addClass('fixToTop');
							} else {
								element.removeClass('fixToTop');
								element.addClass('absTopPos');
							}
						}
					});
				}
			};
		});

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
					"ranges": [1893, 1500, 0],
					"measures": [1200],
					"markers": [1200]
				};

			//attach body svg

				var bodyShape = Snap.selectAll('.body-container');
				console.log(bodyShape);

				//total sleep percentage
				//var sleepPercentage = Snap(10, 10);
				//var honeySleep = sleepPercentage.path("M10-5-10,15M15,0,0,15M0-5-20,15")
				//	.attr({
				//		id: "sleepPattern",
				//		fill: "none",
				//		stroke: "#512b8d",
				//		strokeWidth: 5
				//}).pattern(0, 0, 10, 10);

				//load svg file

				Snap.load('/assets/images/body-svg/beforeSyncBody.svg', function (body) {
					$scope.head = body.select('#b-sync-head');
					$scope.sleepPattern = body.select('#sleep-pattern');
					$scope.boxTotalMinutesAsleep = body.select('#boxTotalMinutesAsleep');



					$scope.arms = body.select('#b-sync-arms');
					$scope.leftArm = body.select('#b-sync-left-arm');
					$scope.rightArm = body.select('#b-sync-right-arm');

					$scope.bottom = body.select('#b-sync-bottom');
					$scope.bottomOutline = body.select('#b-sync-bottom-line');
					$scope.leftAnkle = body.select('#b-sync-ankle-left');
					$scope.rightAnkle = body.select('#b-sync-angkle-right');

					$scope.groupTop = body.select('#b-sync-t');
					$scope.top = body.select('#b-sync-top');
					$scope.neck = body.select('#b-sync-neck');

					$scope.head = body.select('#bg-head');
					$scope.headOutline = body.select('#b-sync-head #outline');
					$scope.refreshHead = body.select('#refresh-head rect');

					$scope.points = body.select('#points');
					$scope.restingHeartRatePoint = body.select('#basePoint-restingHeartRate');
					$scope.foodPlanPoint = body.select('#basePoint-foodPlan');
					//$scope.foodPlanPoint = Snap.select('#basePoint-foodPlan');
					$scope.estimatedCaloriesOutpPoint = body.select('#basePoint-estimatedCaloriesOut');
					$scope.caloriesPoint = body.select('#basePoint-calories');
					$scope.stepsPoint = body.select('#basePoint-steps');
					$scope.activityCaloriesPoint = body.select('#basePoint-activityCalories');
					$scope.floorsPoint = body.select('#basePoint-floors');
					$scope.distancePoint = body.select('#basePoint-distance');

					$scope.logWeightBtn = body.select('#add-btn-logWeight');

					$scope.maskBody = body.select('#mask-all-body');
					$scope.drinkWater = body.select('#drink-water');

					$scope.waterPoint = Snap.select('#waterPoints');
					console.log($scope.waterPoint);


					//$scope.targets[$scope.indexOfTarget.water].bodyRatio
					$scope.waterHeight = 340;


					//$scope.svgBody = body.select('#all');

					// on load, first reset the paths
					$scope.reset = function() {
						//$scope.refreshHead.transform("s0,0");
						bodyShape.forEach(function (el) {
							console.log("body of svg is sycn");
							el.append(body);
						});
					};

					$scope.reset();

					function headHoverIn(delay, length){
						//head part
						$scope.refreshHead.animate({
							height : "97"
						}, length , mina.bounce, function (){
							$scope.sleepPattern.animate({
								fill : Snap('#sleepPattern'),
								height : "75"
							}, length, mina.bounce);
						});

						part100Top(length, false);
						part100TopPoints(length);

						part100Bottom(length, false);

						partMaskWater(length);

						$scope.drinkWater.animate({
							d : "M7.3,140c0,0,8,7.6,20.6,8.6c10.3,0.8,6.6-7.4,24.9-8.2c10.9-0.4,17.9,9.8,27.7,10.4c16,1,16.3-8.7,31-8.7c21.7,0,16.7,9.7,30,9.7c14,0,12-9.7,30-9.7c12,0,22.2,6.2,38.8,0.6V717H7.3V140z"
						}, length , mina.easeinout);

						part100BottomPoints(length);
					}

					function headHoverOut(delay, length){
						$scope.refreshHead.animate({
							height : "55"
						}, length , mina.easeout, function (){
							$scope.sleepPattern.animate({
								height : "35"
							}, length, mina.bounce);
						});

						$scope.top.animate({
							d:"M109,296.6h57.7l0.5-90l31.1-14.8l-11.1-48.2c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l1.1,90H109z"
						}, length + 500 , mina.easeinout, function() {
							$scope.leftArm.animate({
								transform : 'r-0.5,' + $scope.leftArm.getBBox().x + ', ' + $scope.leftArm.getBBox().y + ''
							}, length - 200, mina.easeinout);

							$scope.rightArm.animate({
								transform : 'r0.5,' + $scope.rightArm.getBBox().x + ', ' + $scope.rightArm.getBBox().y + ''
							}, length - 200, mina.easeinout);
						});

						//top part point
						$scope.estimatedCaloriesOutpPoint.animate({
							transform : 't13.5 0'
						}, length + 500, mina.easeinout);

						$scope.bottom.animate({
							d:"M108.8,295.8H52c0,0-19.5,49.2-21.5,116.2c-3.5,108,9,208.1,13,270.5l7,0.4L7.3,715.7l68.3-12.1v-19c0,0,3.2-0.1,7.2-0.5c0,0,22.5-275.2,23.4-305.4h5.2c0.9,30.2,23.7,304.9,23.7,304.9c9,0.6,0,0,6.9,0v20l68.3,12.1l-43.9-33.6l7.9-0.6c3-69.1,15.9-169.3,12.9-273c0-65-21-112.7-21-112.7H108.8"
						}, length , mina.easeinout);

						$scope.leftAnkle.animate({
							x1:"45.2",
							y1:"681",
							x2:"80.2",
							y2:"682.7"
						}, length , mina.easeinout);

						$scope.rightAnkle.animate({
							x1:"172.8",
							y1:"679.8",
							x2:"139.5",
							y2:"682.1"
						}, length , mina.easeinout);

						//add water
						$scope.maskBody.animate({
							d : "M210.3,715.7l-43.9-33.6l7.9-0.6c3-69.1,15.9-169.3,12.9-273c0-60.1-18-105.4-20.7-111.9h0.2l0.5-90l31.1-14.8l-11.1-48.2c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l1.1,89.7C49.7,301.8,32.4,349,30.5,412c-3.5,108,9,208.1,13,270.5l7,0.4L7.3,715.7l68.3-12.1v-19c0,0,3.2-0.1,7.2-0.5c0,0,22.5-275.2,23.4-305.4h5.2c0.9,30.2,23.7,304.9,23.7,304.9c9,0.6,0,0,6.9,0v20L210.3,715.7z"
						}, length , mina.easeinout);

						$scope.drinkWater.animate({
							d : "M7.3,340c0,0,8,7.6,20.6,8.6c10.3,0.8,6.6-7.4,24.9-8.2c10.9-0.4,17.9,9.8,27.7,10.4c16,1,16.3-8.7,31-8.7c21.7,0,16.7,9.7,30,9.7c14,0,12-9.7,30-9.7c12,0,22.2,6.2,38.8,0.6V717H7.3V340z"
						}, length , mina.easeinout);


						//bottom part point
						$scope.caloriesPoint.animate({
							transform : 't5.5 0.5'
						}, length, mina.easeinout);

						$scope.stepsPoint.animate({
							transform : 't17.5 0.5'
						}, length, mina.easeinout);

						$scope.activityCaloriesPoint.animate({
							transform : 't-3.5 0.5'
						}, length, mina.easeinout);

						$scope.floorsPoint.animate({
							transform : 't8.4 4.5'
						}, length, mina.easeinout);

						$scope.distancePoint.animate({
							transform : 't-5.5 -1.5'
						}, length, mina.easeinout);

					}

					var hoverIn = function bodyHover(){
						if(!$scope.isSync) {
							return;
						} else {
							headHoverIn(0, 300);
							console.log('hover in event');
						};
					};

					var hoverOut = function bodyHoverOut() {
						if(!$scope.isSync) {
							return;
						} else {
							headHoverOut(0, 300);
							console.log('hover out event');
						};
					};

					$scope.arms.hover(hoverIn, hoverOut);

					//click event
					var waveAction = function (clickedEle) {
						clickedEle.removeClass('clicked-wave');
						setTimeout(function(){
							clickedEle.addClass('clicked-wave');
						}, 500);
					}

					//happy part
					var actionTotalMinutesAsleepPoint = function() {
						var actionTotalMinutesAsleep = Snap('.today-container :nth-child(1) li:nth-child(1) svg');
						waveAction(actionTotalMinutesAsleep);
					}

					var actiontotalTimeInBedPoint = function() {
						var actiontotalTimeInBedBox = Snap('.today-container :nth-child(1) li:nth-child(2) svg');
						waveAction(actiontotalTimeInBedBox);
					}


					var actionRestingHeartRatePoint = function(){
						var actionRestingHeartRate = Snap('.today-container :nth-child(1) li:nth-child(3) svg');
						waveAction(actionRestingHeartRate);
					}

					var actionWaterPoint = function(){
						var actionWater = Snap('.today-container :nth-child(1) li:nth-child(4) svg');
						waveAction(actionWater);
					}

					$scope.boxTotalMinutesAsleep.click(actionTotalMinutesAsleepPoint);
					$scope.sleepPattern.click(actiontotalTimeInBedPoint);
					$scope.restingHeartRatePoint.click(actionRestingHeartRatePoint);
					$scope.waterPoint.click(actionWaterPoint);


					//balanced part
					var actionFoodPlanPoint = function() {
						var actionFoodPlan = Snap('.today-container :nth-child(2)' +
							' li:nth-child(2) svg');
						waveAction(actionFoodPlan);
					}

					var actionEstimatedCaloriesOutpPoint = function() {
						var actionEstimatedCaloriesOut = Snap('.today-container' +
							' :nth-child(2) li:nth-child(3) svg');
						waveAction(actionEstimatedCaloriesOut);
					}


					var actionLogWeightBtnPoint = function(){
						var actionLogWeightBtn = Snap('.today-container :nth-child(2) li:last-child svg');
						waveAction(actionLogWeightBtn);
					}


					$scope.foodPlanPoint.click(actionFoodPlanPoint);
					$scope.estimatedCaloriesOutpPoint.click(actionEstimatedCaloriesOutpPoint);
					$scope.logWeightBtn.click(actionLogWeightBtnPoint);

					//energetic part
					var actionCaloriesPoint = function() {
						var actionCalories = Snap('.today-container :nth-child(3)' + ' li:nth-child(2) svg');
						waveAction(actionCalories);
					}

					var actionStepsPointPoint = function() {
						var actionStepsPoint = Snap('.today-container :nth-child(3)' +
							' li:nth-child(3) svg');
						waveAction(actionStepsPoint);
					}


					var actionActivityCaloriesPoint = function(){
						var actionActivityCalories = Snap('.today-container' +
							' :nth-child(3) li:nth-child(4) svg');
						waveAction(actionActivityCalories);
					}

					var actionFloorsPoint = function(){
						var actionFloors = Snap('.today-container :nth-child(3)' +
							' li:nth-child(5) svg');
						waveAction(actionFloors);
					}

					var actionDistancePoint = function(){
						var actionDistance = Snap('.today-container :nth-child(3)' +
							' li:nth-child(6) svg');
						waveAction(actionDistance);
					}

					$scope.caloriesPoint.click(actionCaloriesPoint);
					$scope.stepsPoint.click(actionStepsPointPoint);
					$scope.activityCaloriesPoint.click(actionActivityCaloriesPoint);
					$scope.floorsPoint.click(actionFloorsPoint);
					$scope.distancePoint.click(actionDistancePoint);

				});

				//tranform body
				//var syncBtn = angular.element(document.querySelector("#body-container button span"));
				//console.log(syncBtn);

				$scope.isSync = false;
				//'데이터 씽크 이전으로 클릭!'
				//'티셔츠 위에서 마우스  hover'
				$scope.syncBtnText = [
					'클릭! 가상으로 데이터 씽크',
					'팔 위로 마우스 올리기! 운동'
				];

				function part100Top(length, dotted){
					//top part
					$scope.top.animate({
						d:"M109,296h44.7l13.6-90l31.1-14.8L187.2,143c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l13.6,90H109z"
					}, length + 500 , mina.easeinout, function() {
						if(!dotted === true) {
							return;
						} else {
							$scope.top.removeClass('noneStroke-dash7');
							$scope.top.toggleClass('stroke-dash7');
							$scope.neck.removeClass('noneStroke-dash7');
							$scope.neck.toggleClass('stroke-dash7');
							$scope.arms.removeClass('noneStroke-dash7');
							$scope.arms.toggleClass('stroke-dash7');
						}
					});
					$scope.leftArm.animate({
						transform : 'r0.5,' + $scope.leftArm.getBBox().x + ', ' + $scope.leftArm.getBBox().y + '',
						fill : "#FFFFFF"
					}, length + 200, mina.easein);

					$scope.rightArm.animate({
						transform : 'r-0.5,' + $scope.rightArm.getBBox().x + ', ' + $scope.rightArm.getBBox().y + '',
						fill : "#FFFFFF"
					}, length + 200, mina.easein);
				}

				function part100TopPoints(length){
					//top part point
					$scope.estimatedCaloriesOutpPoint.animate({
						transform :$scope.estimatedCaloriesOutpPoint.getBBox().cx + ", " + $scope.estimatedCaloriesOutpPoint.getBBox().cy   + "t-17.5 0"
					}, length, mina.easeinout);

				}

				function part100Bottom(length, dotted){
					$scope.bottom.animate({
						d:"M109,296H64.3c0,0-14.1,20.4-23.3,60.7c-9.3,40.3-3.7,103.4,8.3,148.9l5.1,172L7.6,715.2 l68.2-12.1v-19c0,0,17.2-165.5,17.2-175.1c0,0,12.5-102.2,13.4-132.4h5.2C112.5,406.7,125,509,125,509 c0,9.5,17.2,175.1,17.2,175.1v19l68.2,12.1l-46.8-37.6l5.1-172c12.1-45.4,17.6-108.5,8.3-148.9c-9.3-40.3-23.3-60.7-23.3-60.7H109"
					}, length , mina.easeinout, function () {
						if(!dotted === true) {
							return;
						} else {
							$scope.bottom.removeClass('noneStroke-dash7');
							$scope.bottom.toggleClass('stroke-dash7');
							$scope.bottomOutline.removeClass('noneStroke-dash7');
							$scope.bottomOutline.toggleClass('stroke-dash7');
						}

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

				function part100BottomPoints(length){
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

				}

				function partMaskWater(length){
					//add water
					$scope.maskBody.animate({
						d : "M210.1,716.1l-46.8-37.6l5.1-172c12.1-45.4,17.6-108.5,8.3-148.9c-9.3-40.3-23.3-60.7-23.3-60.7l13.6-90l31.1-14.8l-11.2-48.2c-26.4-28.8-78.2-25.5-78.2-25.5s-51.8-3.2-78.2,25.5l-11.1,48.2l31,14.8l13.6,90c0,0-14.1,20.4-23.3,60.7C31.4,397.9,37,461,49,506.5l5.1,172L7.3,716.1L75.5,704v-19c0,0,17.2-165.5,17.2-175.1c0,0,12.5-102.2,13.4-132.4h5.2c0.9,30.1,13.4,132.4,13.4,132.4c0,9.5,17.2,175.1,17.2,175.1v19L210.1,716.1z"
					}, length , mina.easeinout);
				}

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

						$scope.sleepPattern.animate({
							height : "3"
						}, length, mina.easeinout);

						part100Top(length, true);
						part100TopPoints(length);
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
							part100Bottom(length, true);

							partMaskWater(length);

							$scope.drinkWater.animate({
								d : "M7.3,700c0,0,8,7.6,20.6,8.6c10.3,0.8,6.6-7.4,24.9-8.2c10.9-0.4,17.9,9.8,27.7,10.4c16,1,16.3-8.7,31-8.7c21.7,0,16.7,9.7,30,9.7c14,0,12-9.7,30-9.7c12,0,22.2,6.2,38.8,0.6V717H7.3V700z"
							}, length , mina.easeinout);

							part100BottomPoints(length);

						}
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
				};

			}
		}
	}
})();
