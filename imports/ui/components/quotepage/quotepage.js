import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

import '../../../startup/pages.js';

import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Projects } from '../../../api/projects';
import { Quotes } from '../../../api/quotes';

import template from './quotepage.html';

class Quotepage {
    constructor($scope, $reactive, $stateParams, $state) {
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
            date: 1
        };
        this.job = {};
        this.searchText = '';

        this.comment = {};
        this.myComment = {};
        $scope.latestComment = {};
        this.required = false;
        this.requiredFields = false;
        this.changesSaved = false;
        this.jobIsAdded = false;

        this.subscribe('users');

        this.subscribe('projects');

        this.subscribe('quotes');

        this.helpers({
            project() {
                var selector = { _id: $stateParams.projectId };
                var projects = Projects.findOne(selector);
                console.info('poprojectssts', projects);
                return projects;
            },
            quotes() {
                var selector = { projectID: $stateParams.projectId };
                var quotes = Quotes.find(selector);
                console.info('quotes', quotes);
                return quotes;
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

        this.submit = function () {
            console.info('submitted post', this.job);
            if (this.job.name && this.job.description) {
                this.job.projectID = $stateParams.projectId;
                this.job.owner = Meteor.userId();
                this.job.date = new Date();
                this.job.dateTime = this.job.date.getTime();
                var users = Meteor.user();
                console.info('users', users);
                this.job.ownerName = users.username;
                this.job.jobtitle = users.jobtitle;
                this.job.profilePhoto = users.profilePhoto;
                this.job.status = true;
                this.job.filecount = 0;
                this.job.imagecount = 0;
                this.job.videocount = 0;
                var status = Projectjobs.insert(this.job);
                console.info('status', status);
                this.required = false;
                this.jobIsAdded = true;
                this.job = {};

                var selector = { _id: $stateParams.projectId };
                var project = Projects.findOne(selector);
                var projectJobs = project.jobcount;
                console.info('projectJobs', projectJobs);
                var projectJobCount = projectJobs + 1;
                console.info('projectJobCount', projectJobCount);

                Meteor.call('upsertProjectJob', $stateParams.projectId, projectJobCount, function (err, result) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('changed file count', err);
                    }
                });
                //angular.element("body").removeClass("modal-open");
                $('#modal-jobs').modal('hide');
                //var removeMe = angular.element(document.getElementsByClassName("modal-backdrop"));
                //removeMe.remove();
                //this.reset();
                //window.scrollTo(0,document.body.scrollHeight);
            } else {
                this.required = true;
            }
        }

        this.dismissNotif = function () {
            this.required = false;
            $scope.uploadSuccess = false;
            this.requiredFields = false;
            this.changesSaved = false;
            this.jobIsAdded = false;
        }


    }

    pageChanged(newPage) {
        this.page = newPage;
        console.info('new page', this.page);
    }


}

const name = 'quotepage';

//Login.$inject = ['$scope', '$reactive', '$state'];

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    utilsPagination
]).component(name, {
    template,
    controllerAs: name,
    controller: ['$scope', '$reactive', '$stateParams', '$state', Quotepage]
})
    .config(['$stateProvider',
        function ($stateProvider) {
            //'ngInject';
            $stateProvider
                .state('quotepage', {
                    url: '/quotepage/:projectId',
                    template: '<quotepage></quotepage>',
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

