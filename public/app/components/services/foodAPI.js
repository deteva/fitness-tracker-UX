/**
 * Created by tmin_lim on 16. 4. 28..
 */
(function() {
	'use strict';
	angular.module('app.services').factory('foodAPI', foodAPI);

	foodAPI.$inject = ['$log'];

	function foodAPI($log) {
		var Foods = ["김밥", "나물", "미역국", "귤","Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Dakota", "North Carolina", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
		$log.info('foodAPI in');
		return Foods;
	}
})();
