/**
 * Created by tmin_lim on 16.4. 11..
 */
(function() {
	'use strict';
	angular.module('app.services').factory('dataAPI', dataAPI);

	dataAPI.$inject = ['$http','$log'];

	function dataAPI($http, $log) {
		var getActivityByfitbit = function() {
			return makeRequest('/activity/json');
		}

		var getHeartrateByfitbit = function() {
			return makeRequest('/heartrate/json');
		}

		var getNutritionByfitbit = function() {
			return makeRequest('/nutrtion/json');
		}

		var getSleepByfitbit = function() {
			return makeRequest('/sleep/json');
		}

		var getSocialByfitbit = function() {
			return makeRequest('/social/json');
		}

		function makeRequest(url, paramMethod) {
			if(!paramMethod) paramMethod = 'GET';

			return $http({
				'url'    : url,
				'method' : paramMethod,
				'headers': {
					'Content-Type': 'application/json'
				},
				'cache'  : true
			}).then(function (response) {
				$log.info('dataAPI makeRequest: ' + paramMethod + ' : ' + url);
				//$log.log(response.data);
				return response.data;
			}).catch(dataServiceError);
		}

		function dataServiceError(errorResponse) {
			$log.error('XHR_Failed for DataService');
			$log.error(errorResponse);
			return errorResponse;
		}

		return {
			'getActivityByfitbit': getActivityByfitbit,
			'getHeartrateByfitbit': getHeartrateByfitbit,
			'getNutritionByfitbit': getNutritionByfitbit,
			'getSleepByfitbit': getSleepByfitbit,
			'getSocialByfitbit': getSocialByfitbit
		}
	}
})();
