/**
 * Created by tmin_lim on 16. 4. 28..
 */
(function() {
	'use strict';

	angular
		.module('app.core')
		.directive('krInput', KrInput)
		.config(config);

	KrInput.$inject = ['foodAPI'];
	config.$inject = ['$provide'];

	function KrInput(foodAPI) {
		console.log('directive KrInput in');
		return {
			templateUrl: '/app/components/number-today/kr-input.html',
			//priority : 2,
			restrict: 'E',
			controller: function($scope, $log) {
				$scope.foods = foodAPI;
				$scope.selected = undefined;
				$log.info($scope.foods);
				$scope.heart = $scope.heartrateData;
				$scope.friend = $scope.friendData.no3;
			}
			//compile : function(element) {
			//	element.on('compositionstart', function(e) {
			//		e.stopImmediatePropagation();
			//	});
			//}
		}
	}

	function config($provide) {
		$provide.decorator('inputDirective', function($delegate, $log) {
			$log.debug('Hijacking input directive');
			var directive = $delegate[0];
			angular.extend(directive.link, {
				post: function(scope, element, attr, ctrls) {
					element.on('compositionupdate', function (event) {
						$log.debug('Composition update, faking end');
						element.triggerHandler('compositionend');
					})
				}
			});
			return $delegate;
		});
	}
})();