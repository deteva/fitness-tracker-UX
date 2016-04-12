'use strict';

var mainName = 'app';

// Create the main application
var mainModule = angular.module(mainName, ['app.core', 'app.routes', 'app.services', 'ngResource', 'ngRoute']);

// Configure the hashbang URLs using the $locationProvider services
mainModule.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.element(document).ready(function() {
	angular.bootstrap(document, [mainName]);
});