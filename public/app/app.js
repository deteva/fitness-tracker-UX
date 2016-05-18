'use strict';

var mainName = 'app';

// Create the main application
var mainModule = angular.module(mainName, ['app.core', 'app.routes', 'app.services', 'ngResource', 'ngRoute']);

// Configure the hashbang URLs using the $locationProvider services
mainModule.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	}
]);

//angularMoment:internationalization support
mainModule.run(function (amMoment) {
	amMoment.changeLocale('ko');
});

angular.element(document).ready(function() {
	angular.bootstrap(document, [mainName]);
});