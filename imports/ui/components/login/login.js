import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import template from './login.html';
 
class Login {
  constructor($scope, $reactive, $state) {
    //'ngInject';
 
    $reactive(this).attach($scope);

    this.login = {};
    this.error = false;
    this.signUpNow = false;
    this.register = {};
    this.boat = {};

    this.subscribe('users');
 
    this.helpers({
      isLoggedIn() {
        return !!Meteor.userId();
      },
      currentUserId() {
        return Meteor.userId();
      }
    });

    this.signin = function(){
        console.info('this.login', this.login);
        Meteor.loginWithPassword(this.login.username, this.login.password,
            this.$bindToContext((err) => {
              if (err) {
                $scope.loginerror = err.reason;
                    console.info('err: ' ,   $scope.loginerror );
                    this.error = true;
                } else {
                    var user = Meteor.user();
                    console.info('user', user);
                      $state.go('forums', {}, {reload: 'forums'});
                }
              })
            );
      }

    this.signup = function() {
      $scope.signUpNow = !$scope.signUpNow;
    }

    $scope.createProfile = function(details){
      console.info('employee details', $scope.profile)
      $scope.profile.userID = details;
      $scope.profile.role = 'admin';
      var boatID = $scope.profile.boatID;
      var jobs = true;
      var logbook = true;
      var inventory = true;
      var employees = true;
      var superadmin = true;
      Meteor.call('upsertNewRoleFromRegister', details, $scope.profile.role, boatID, jobs, logbook, inventory, employees, superadmin, function(err, detail) {
        console.info('detail', detail);
          if (err) {
              console.info('err', err);
         } else {
           console.info('success', detail);
         }
      });
      var downloadurl = '../assets/img/user.jpg';
      Meteor.call('upsertPhotoUser', $scope.profile.userID, downloadurl, function(err, result) {
        if (err) {
          console.info('err', err);
        } else {
          console.info('uploaded', err);
       }
      });
      var status = Profiles.insert($scope.profile);
    }

    this.registerNow = function() {
      if(this.register.password == this.register.password2){
        this.error = false;
        if(this.register.license == 'tySLTdymp2018'){
          console.info('this.register.boatID', this.register.boatID);
          //this.boat.boatID = this.register.boatID;
          this.register.boatName = this.register.boatID;
          console.info('this.boat.boatID', this.boat.boatID);
          this.boat.date = new Date();
          this.boat.status = 'active';
          var boatStatus = Boats.insert(this.boat);
          this.register.boatID = boatStatus;
          console.info('boatStatus', this.register.boatID);
          console.info('this.register.boatID', this.register.boatID);
          this.error = false;
          $scope.inProgress = true;
          this.register.date = new Date();
          $scope.profile = this.register;
          console.info('profile', this.register);
          Meteor.call('createUsersFromRegister', this.register.password, this.register.username, this.register.boatID, function(err, detail) {
              console.info('detail', detail);
                if (err) {
                    console.info('err', err);
                    $scope.inProgress = false;
                    $scope.loginerror = err.reason;
                    console.info('err: ' ,   $scope.loginerror );
                    this.error = true;
                    window.setTimeout(function(){
                      $scope.$apply();
                    },2000);
               } else {
                 this.userID = detail;
                 console.info('success', this.userID);
                 this.cancreate = true;
                 console.info('cancreate', this.cancreate);
                 $scope.inProgress = false;
                 $scope.completed = true;
                 $scope.signUpNow = !$scope.signUpNow;
                 window.setTimeout(function(){
                  $scope.$apply();
                },2000);
                 $scope.createProfile(detail);
               }
            });

        } else {
          $scope.loginerror = 'invalid License Code';
          this.error = true;
        }
      } else {
        $scope.loginerror = 'passwords do not match';
        this.error = true;
      }
    }
  }

  isOwner(party) {
    return this.isLoggedIn && party.owner === this.currentUserId;
  }

  
}
 
const name = 'login';

//Login.$inject = ['$scope', '$reactive', '$state'];
 
// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  utilsPagination
]).component(name, {
  template,
  controllerAs: name,
  controller: ['$scope', '$reactive', '$state', Login]
})
.config(['$stateProvider',
function($stateProvider) {
    //'ngInject';
    $stateProvider
      .state('login', {
        url: '/',
        template: '<login></login>',
        resolve: {
            currentUser($q, $state) {
                if (!Meteor.userId()) {
                  return $q.resolve();
                } else {
                  return $q.reject('LOGGED_IN');
                };
            }
          }
      });
    }
]);

