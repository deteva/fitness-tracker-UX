/**
 * Created by tmin_lim on 16. 4. 28..
 */
(function() {
	'use strict';
	angular.module('app.services').factory('foodAPI', foodAPI);

	foodAPI.$inject = ['$log'];

	function foodAPI($log) {
		var Foods = [
		 	{
				"name" : "짬뽕" ,
				"cals": 764,
				"carbs": 133,
				"fiber": 3,
				"fat": 12
			},
			{
				"name" : "올리브유",
				"cals": 27,
				"carbs": 0,
				"fiber": 0,
				"fat": 3
			},
			{
				"name" : "그릭 요거트",
				"cals": 75,
				"carbs": 11,
				"fiber": 0,
				"fat": 2
			},
			{	"name" : "딸기",
				"cals": 20,
				"carbs": 5,
				"fiber": 1,
				"fat": 3
			},
			{	"name" : "아메리카노",
				"cals": 4,
				"carbs": 0,
				"fiber": 0,
				"fat": 1
			},
			{	"name" : "김밥 1개",
				"cals": 31,
				"carbs": 7,
				"fiber": 1,
				"fat": 1
			}
		];

		$log.info('foodAPI in');
		return Foods;
	}
})();
