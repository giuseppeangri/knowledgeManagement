(function() {
  
  'use strict';
  
  /**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
  angular
    .module('app', [
      'ngAnimate',
      'ngAria',
      'ngCookies',
      'ngMessages',
      'ngResource',
      'ngSanitize',
      'ngStorage',
      'ngStore',
      'ui.router',
      'ui.utils',
      'ui.bootstrap',
      'ui.load',
      'ui.jp',
      'ui.select',
      'pascalprecht.translate',
      'oc.lazyLoad',
      'angular-loading-bar',
      'ngMaterial',
      'app.articles',
      'app.projects',
      'app.templates',
      'app.tools',
      'app.tutorials',
      'app.users',
      'app.authentication',
      'app.efforts',
      'app.metrics',
      'app.tags',
      'textAngular',
      'angularFileUpload'
    ])
    /*.constant('AUTH_URL', 'http://localhost:8080/auth/')
    .constant('API_URL', 	'http://localhost:8080/api/v1/');*/
    .constant('AUTH_URL', 'http://kmgps.cloudapp.net/auth')
    .constant('API_URL', 	'http://kmgps.cloudapp.net/api/v1/');

})();