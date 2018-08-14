import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

//import '../../../startup/pages.js';

import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Projects } from '../../../api/projects';
import { Profiles } from '../../../api/profiles';

import template from './quotes.html';

class Quotes {
    constructor($scope, $reactive, $state) {
        //'ngInject';
        var animationTimer;

        var hMenu = $("[data-pages-init='horizontal-menu']");
        autoHideLi();
        $(document).on('click', '.menu-bar > ul > li', function () {
            if ($(this).children("ul").length == 0) {
                return;
            }
            if ($(window).width() < 992) {
                var menubar = $('.menu-bar');
                var el = $(this);
                var li = menubar.find('li');
                var sub = $(this).children('ul');

                if (el.hasClass("open active")) {
                    el.find('.arrow').removeClass("open active");
                    sub.slideUp(200, function () {
                        el.removeClass("open active");
                    });

                } else {
                    menubar.find('li.open').find('ul').slideUp(200);
                    menubar.find('li.open').find('a').find('.arrow').removeClass('open active');
                    menubar.find('li.open').removeClass("open active");
                    el.find('.arrow').addClass("open active");
                    sub.slideDown(200, function () {
                        el.addClass("open active");
                    });
                }
            } else {
                if ($(this).hasClass('opening')) {
                    _hideMenu($(this));
                }
                else {
                    _showMenu($(this));
                }
            }

        });

        var resizeTimer;
        $(window).on('resize', function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                autoHideLi();
            }, 250);
        });

        $('.content').on('click', function () {
            $('.horizontal-menu .bar-inner > ul > li').removeClass('open');
            $('.menu-bar > ul > li').removeClass('open opening').children("ul").removeAttr("style");
            $("body").find(".ghost-nav-dropdown").remove();
        });

        $('[data-toggle="horizontal-menu"]').on('click touchstart', function (e) {
            e.preventDefault();
            $('body').toggleClass('horizontal-menu-open');
            if (!$('.horizontal-menu-backdrop').length) {
                $('.header').append('<div class="horizontal-menu-backdrop"/>');
                $('.horizontal-menu-backdrop').fadeToggle('fast');
            } else {
                $('.horizontal-menu-backdrop').fadeToggle('fast', function () {
                    $(this).remove();
                });
            }

            $('.menu-bar').toggleClass('open');
        });

        function autoHideLi() {
            var hMenu = $("[data-pages-init='horizontal-menu']");
            var extraLiHide = parseInt(hMenu.data("hideExtraLi")) || 0
            if (hMenu.length == 0) {
                return
            }
            var hMenuRect = hMenu[0].getBoundingClientRect();
            var liTotalWidth = 0;
            var liCount = 0;
            hMenu.children('ul').children('li.more').remove();
            hMenu.children('ul').children('li').each(function (index) {
                $(this).removeAttr("style");
                liTotalWidth = liTotalWidth + $(this).outerWidth(true);
                liCount++;
            });

            if ($(window).width() < 992) {
                return;
            }

            var possibleLi = parseInt(hMenuRect.width / (liTotalWidth / liCount)) - 1;
            possibleLi = possibleLi - extraLiHide;

            if (liCount > possibleLi) {
                var wrapper = createWrapperLI(hMenu);
                for (var i = possibleLi; i < liCount; i++) {
                    var currentLi = hMenu.children('ul').children('li').eq(i);
                    var clone = currentLi.clone();
                    clone.children("ul").addClass("sub-menu");
                    wrapper.children("ul").append(clone);
                    currentLi.hide();
                }
            }

        }

        function createWrapperLI(hMenu) {
            var li = hMenu.children('ul').append("<li class='more'><a href='javascript:;'><span class='title'><i class='pg pg-more'></i></span></a><ul></ul></li>");
            li = hMenu.children('ul').children('li.more');
            return li;
        }

        function _hideMenu($el) {
            var ul = $($el.children("ul")[0]);
            var ghost = $("<div class='ghost-nav-dropdown'></div>");
            if (ul.length == 0) {
                return;
            }
            var rect = ul[0].getBoundingClientRect();
            ghost.css({
                "width": rect.width + "px",
                "height": rect.height + "px",
                "z-index": "auto"
            })
            $el.append(ghost);
            var timingSpeed = ul.children("li").css('transition-duration');

            timingSpeed = parseInt(parseFloat(timingSpeed) * 1000);
            $el.addClass('closing');
            window.clearTimeout(animationTimer);
            animationTimer = window.setTimeout(function () {
                ghost.height(0);
                $el.removeClass('open opening closing');
            }, timingSpeed - 80);
        }
        function _showMenu($el) {

            var ul = $($el.children("ul")[0]);
            var ghost = $("<div class='ghost-nav-dropdown'></div>");
            $el.children(".ghost-nav-dropdown").remove();
            $el.addClass('open').siblings().removeClass('open opening');
            if (ul.length == 0) {
                return;
            }
            var rect = ul[0].getBoundingClientRect();
            ghost.css({
                "width": rect.width + "px",
                "height": "0px"
            });
            $el.append(ghost);
            ghost.height(rect.height);
            var timingSpeed = ghost.css('transition-duration');

            timingSpeed = parseInt(parseFloat(timingSpeed) * 1000)
            window.clearTimeout(animationTimer);
            animationTimer = window.setTimeout(function () {
                $el.addClass('opening');
                ghost.remove()
            }, timingSpeed);
        }

        $reactive(this).attach($scope);

        this.perPage = 10;
        this.page = 1;
        this.sort = {
            date: -1
        };
        this.searchText = '';

        this.post = {};
        this.project = {};
        this.required = false;
        this.myPostings = true;
        this.clickMore = false;
        this.clickMore2 = false;

        this.subscribe('users');

        this.subscribe('profiles');

        this.subscribe('otherprojects', () => [{
            limit: parseInt(this.perPage),
            skip: parseInt((this.getReactively('page') - 1) * this.perPage),
            sort: this.getReactively('sort')
        }, this.getReactively('searchText'),
        $scope.getReactively('ownerID')
        ]);

        this.helpers({
            projectposts() {
                $scope.ownerID = Meteor.userId();
                var selector = {owner: {$ne: $scope.ownerID}};

                var projects = Projects.find(selector, {
                    sort: this.getReactively('sort')
                });
                console.info('projects', projects);
                return projects;
            },
            postsCount() {
                return Counts.get('numberOfOtherProjects');
            },
            isLoggedIn() {
                return !!Meteor.userId();
            },
            currentUserId() {
                return Meteor.userId();
            },
            currentUser() {
                return Meteor.user();
            }
        });

        this.gotoForums = function () {
            $state.go('forums', {}, { reload: 'forums' });
        }
        this.gotoQuotes = function () {
            $state.go('quotes', {}, { reload: 'quotes' });
        }
        this.gotoMyPosts = function () {
            $state.go('mypostings', {}, { reload: 'mypostings' });
        }
        this.gotoContractors = function () {
            $state.go('contractors', {}, { reload: 'contractors' });
          }
        this.logout = function () {
            /*window.loading_screen = pleaseWait({
              logo: "../assets/global/images/logo/logo-white2.png",
              backgroundColor: '#8c9093',
              loadingHtml: "<div class='sk-spinner sk-spinner-wave'><div class='sk-rect1'></div><div class='sk-rect2'></div><div class='sk-rect3'></div><div class='sk-rect4'></div><div class='sk-rect5'></div></div>"
            });*/
            Accounts.logout();
            window.setTimeout(function () {
                //window.loading_screen.finish();
                $state.go('login', {}, { reload: 'login' });
            }, 2000);
        }

        this.clickOtherPosts = function () {
            this.myPostings = !this.myPostings;
        }

        this.thisHeight = function (post) {
            var varName = "#checkHeight" + post._id;
            console.info('varName', varName);
            var result = $(varName).height();
            console.info('result', result);
            return result;
        }

        this.thisHeight2 = function (post) {
            var varName = "#checkHeight2" + post._id;
            var result = $(varName).height();
            console.info('result', result);
            return result;
        }

        this.submit = function () {
            console.info('submitted post', this.project);
            if (this.project.name && this.project.details) {
                this.project.owner = Meteor.userId();
                $scope.projectUserID = this.project.owner;
                console.info('inventory', this.post);
                this.project.date = new Date();
                this.project.dateTime = this.project.date.getTime();
                this.project.datePosted = new Date();
                var users = Meteor.user();
                console.info('users', users);
                this.project.ownerName = users.username;
                this.project.profilePhoto = users.profilePhoto;
                this.project.boatName = users.boatName;
                this.project.jobtitle = users.jobtitle;
                this.project.status = true;
                this.project.filecount = 0;
                this.project.imagecount = 0;
                this.project.videocount = 0;
                this.project.jobcount = 0;
                this.project.quotecount = 0;

                var selector = { userID: this.project.owner };
                var profiles = Profiles.find(selector);
                profiles.forEach(function (profile) {
                    if (profile.userID == $scope.projectUserID) {
                        $scope.fullName = profile.firstName + ' ' + profile.lastName;
                        try {
                            if (profile.email) {
                                $scope.email = profile.email;
                            } else {
                                $scope.email = 'none';
                            }
                        } catch (err) {
                            $scope.email = 'none';
                        }
                    }
                })
                console.info('email details', $scope.email);
                this.project.email = $scope.email;
                this.project.fullName = $scope.fullName;

                var status = Projects.insert(this.project);
                console.info('status', status);
                var projectCode = status.substring(0, 5);
                console.info('projectCode', projectCode);
                Meteor.call('upsertProjectCode', status, projectCode, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
                this.required = false;
                this.project = {};
                $scope.email = '';
                $scope.fullName = '';
                $scope.projectUserID = '';
                angular.element("body").removeClass("modal-open");
                $('#modal-project').modal('hide');
                $state.go('projectdetails', { projectId: status }, { reload: 'projectdetails' });
                var removeMe = angular.element(document.getElementsByClassName("modal-backdrop"));
                removeMe.remove();
                //this.reset();
            } else {
                this.required = true;
            }
        }

        this.dismissNotif = function () {
            this.required = false;
        }


    }

    pageChanged(newPage) {
        this.page = newPage;
        console.info('new page', this.page);
    }


}

const name = 'quotes';

//Login.$inject = ['$scope', '$reactive', '$state'];

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    utilsPagination
]).component(name, {
    template,
    controllerAs: name,
    controller: ['$scope', '$reactive', '$state', Quotes]
})
    .config(['$stateProvider',
        function ($stateProvider) {
            //'ngInject';
            $stateProvider
                .state('quotes', {
                    url: '/quotes',
                    template: '<quotes></quotes>',
                    resolve: {
                        currentUser($q, $state) {
                            if (!Meteor.userId()) {
                                return $q.reject('AUTH_REQUIRED');
                            } else {
                                return $q.resolve();
                            };
                        }
                    }
                });
        }
    ]);

