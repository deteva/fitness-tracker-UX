/**
 * Created by tmin_lim on 16.
 * 4. 12..
 */
angular
	.module('app.routes', ['ngRoute'])
	.config(routes);

function routes($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/app/main/main.html',
			controller: 'MainCtrl',
			resolve: {
				"activityByfitbit": function(dataAPI, $log) {
					return dataAPI.getActivityByfitbit().then(function (data) {
						$log.info('app.routes module: GET/ dataByfitbit resolve');
						$log.log(data);
						return data;
					});
				},
				"heartrateByfitbit" : function(dataAPI, $log) {
					return dataAPI.getHeartrateByfitbit().then(function (data) {
						$log.info('app.routes module: GET/ heartrateByfitbit resolve');
						$log.log(data);
						return data;
					});
				},
				"nutritionByfitbit" : function(dataAPI, $log) {
					return dataAPI.getNutritionByfitbit().then(function (data) {
						$log.info('app.routes module: GET/ getNutritionByfitbit resolve');
						$log.log(data);
						return data;
					});
				},
				"sleepByfitbit" : function(dataAPI, $log) {
					return dataAPI.getSleepByfitbit().then(function (data) {
						$log.info('app.routes module: GET/ getSleepByfitbit resolve');
						$log.log(data);
						return data;
					});
				},
				"socialByfitbit" : function(dataAPI, $log) {
					return dataAPI.getSocialByfitbit().then(function (data) {
						$log.info('app.routes module: GET/ socialByfitbit resolve');
						$log.log(data);
						return data;
					});
				}
			}

		});
		//.when('/404', {
		//	templateUrl: '/app/components/404/404.tpl.html'
		//})
		//.otherwise({
		//	redirectTo: '/404'
		//});
}
