/**
 * Created by tmin_lim on 16. 6. 27..
 */
'use strict';

var mainName = 'app';

// Create the main application
var mainModule = angular.module(mainName, ['ngLoadScript']);

// Configure the hashbang URLs using the $locationProvider services
mainModule.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
		$locationProvider.hashPrefix('#_=_');
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
		if (window.location.hash && window.location.hash == '#_=_') {
			window.location.hash = '';
		}
	}
]);


angular.element(document).ready(function() {
	angular.bootstrap(document, [mainName]);
});
