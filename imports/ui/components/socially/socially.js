import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import '../../../startup/accounts-config.js';

//import '../../../startup/pages.js';
//import '../../../startup/notifications.js';
 
import template from './socially.html';
import Navigation from '../navigation/navigation';
import Login from '../login/login';
import Forums from '../forums/forums';
import Topic from '../topic/topic';
 
class Socially {}
 
const name = 'socially';
 
// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  Navigation.name,
  Login.name,
  Forums.name,
  Topic.name,
  'accounts.ui',
]).component(name, {
  template,
  controllerAs: name,
  controller: Socially
})
.config(['$locationProvider', '$urlRouterProvider', '$qProvider', '$stateProvider',
function config($locationProvider, $urlRouterProvider, $qProvider, $stateProvider) {
  //'ngInject';
  
  $locationProvider.html5Mode(true);
  
  $urlRouterProvider.otherwise('/not-found');
  
  $qProvider.errorOnUnhandledRejections(false);
  }
])
.run(['$rootScope', '$state', '$stateParams',
function run($rootScope, $state, $stateParams) {
  //'ngInject';
  console.log('daan ditolabas');
  console.info('rootscope', $rootScope);
  console.info('rootscopeobn', $rootScope.$on.$stateChangeError);

  $state.defaultErrorHandler(function(error) {

    console.info('pasok', error);
    console.info('pasok', error.detail);
    // This is a naive example of how to silence the default error handler.
    if(error.detail == 'AUTH_REQUIRED'){
      $state.go('login', {}, {reload: 'login'});
    }
    if(error.detail == 'LOGGED_IN'){
      $state.go('dashboard', {}, {reload: 'dashboard'});
    } else {
      console.log('nag else');
      $state.go('login', {}, {reload: 'login'});
    }


  });
}
]);


 
