'use strict';

var mainName = 'app';

// Create the main application
var mainModule = angular.module(mainName, ['app.core', 'app.routes', 'app.services', 'ngResource', 'ngRoute', 'ngMessages']);
//	.directive('loadScript', [function() {
//		return function(scope, element, attrs) {
//			<!-- hide except chrome browser -->
//			if(navigator.userAgent.indexOf("Chrome") === -1 ) {
//				console.log(navigator.userAgent);
//				var txtDiv=document.createElement('div');
//				txtDiv.id= "desc";
//				document.body.appendChild(txtDiv);
//				document.getElementById("desc").innerHTML="건강한 습관을 만들어주는 " +
//					"대시보드 " +
//					"디자인은, " +
//					"chrome에서 보기를 추천합니다.";
////            debugger;
//			} else {
//				angular.element('<!-- SERVICES --><script src="/app/components/services/dataAPI.js"></script><script src="/app/components/services/foodAPI.js"></script><!--Load the dashboard main module --><script src="/app/main/main.ctrl.js"></script><!-- DIRECTIVES --><script src="/app/components/body-shape/body-shape.drct.js"></script><script src="/app/components/number-today/number-today.drct.js"></script><script src="/app/components/feedback/feedback.drct.js"></script>').append(element);
//			}
//		}
//	}]);



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

//angularMoment:internationalization support
mainModule.run(function (amMoment) {
	amMoment.changeLocale('ko');
});

angular.element(document).ready(function() {
	angular.bootstrap(document, [mainName]);
});


