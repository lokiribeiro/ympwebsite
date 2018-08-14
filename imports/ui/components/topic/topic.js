import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

import '../../../startup/pages.js';

import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Posts } from '../../../api/posts';
import { Comments } from '../../../api/comments';
import { Unreadposts } from '../../../api/unreadposts';

import template from './topic.html';

class Topic {
    constructor($scope, $reactive, $stateParams, $state) {
        angular.element(document).ready(function () {
            var userID = Meteor.userId();
            var selector = {
                $and: [
                    { userID: userID },
                    { postID: $stateParams.topicId }
                ]
            };
            var unreadposts = Unreadposts.findOne(selector);
            if (unreadposts) {
                var unread = false;
                Meteor.call('upsertUnread', unreadposts._id, unread, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
            } else {
                var unreadUpdate = {};
                unreadUpdate.unread = false;
                unreadUpdate.userID = userID;
                unreadUpdate.postID = $stateParams.topicId;
                var status = Unreadposts.insert(unreadUpdate);
                console.info('insert unread', status);
            }

        });



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
        this.searchText = '';

        this.comment = {};
        this.myComment = {};
        $scope.latestComment = {};
        this.required = false;

        this.subscribe('users');

        this.subscribe('individualpost');

        this.subscribe('unreadposts');

        this.subscribe('comments', () => [{
            limit: parseInt(this.perPage),
            skip: parseInt((this.getReactively('page') - 1) * this.perPage),
            sort: this.getReactively('sort')
        }, this.getReactively('searchText')
        ]);

        this.helpers({
            forumposts() {
                var selector = { _id: $stateParams.topicId };
                var posts = Posts.findOne(selector);
                console.info('posts', posts);
                return posts;
            },
            comments() {
                var selector = { postID: $stateParams.topicId };
                var comments = Comments.find(selector, {
                    sort: this.getReactively('sort')
                });
                console.info('comments', comments);
                return comments;
            },
            postsCount() {
                return Counts.get('numberOfPosts');
            },
            commentsCount() {
                return Counts.get('numberOfComments');
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
            console.info('submitted post', this.comment);
            if (this.comment.reply) {
                this.comment.postID = $stateParams.topicId;
                this.comment.owner = Meteor.userId();
                this.comment.date = new Date();
                this.comment.dateTime = this.comment.date.getTime();
                var users = Meteor.user();
                console.info('users', users);
                this.comment.name = users.username;
                this.comment.jobtitle = users.jobtitle;
                this.comment.profilePhoto = users.profilePhoto;
                this.comment.status = true;
                var status = Comments.insert(this.comment);
                console.info('status', status);

                var selector = { postID: $stateParams.topicId };
                var comments = Comments.find(selector);
                var totalPosts = comments.count();

                Meteor.call('upsertPost', this.comment.postID, this.comment.date, this.comment.name, this.comment.profilePhoto, totalPosts, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });

                var selector = { postID: $stateParams.topicId }
                var unreadposts = Unreadposts.find(selector);

                if (unreadposts) {
                    unreadposts.forEach(function (unreadpost) {
                        var unread = true;
                        Meteor.call('upsertUnread', unreadpost._id, unread, function (err, detail) {
                            if (err) {
                                console.info('err', err);
                            } else {
                                console.info('success', detail);
                            }
                        });
                    });
                }

                this.required = false;
                this.comment = {};
                //angular.element("body").removeClass("modal-open");
                $('#modal-responsive').modal('hide');
                //var removeMe = angular.element(document.getElementsByClassName("modal-backdrop"));
                //removeMe.remove();
                //this.reset();
            } else {
                this.required = true;
            }
        }

        this.submitEdit = function () {
            console.info('edit post', this.forumposts);
            if (this.forumposts.details && this.forumposts.subject) {
                Meteor.call('updatePost', this.forumposts._id, this.forumposts.details, this.forumposts.subject, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
                this.required = false;
                $('#modal-edit').modal('hide');
            } else {
                this.required = true;
            }
        }

        this.deleteNow = function () {
            var status = Posts.remove($stateParams.topicId);
            console.info('remove status', status);
            $('#modal-delete').modal('hide');
            angular.element("body").removeClass("modal-open");
            var removeMe = angular.element(document.getElementsByClassName("modal-backdrop"));
            removeMe.remove();
            $state.go('forums', {}, { reload: 'forums' });
        }

        this.editComment = function () {
            console.info('edit post', this.myComment);
            if (this.myComment.reply) {
                Meteor.call('updateComment', this.myComment._id, this.myComment.reply, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
                this.required = false;
                $('#modal-editComment').modal('hide');
            } else {
                this.required = true;
            }
        }

        this.editMyComment = function (comment) {
            this.myComment = comment;
            console.info('myComment', comment);
        }

        this.deleteMyComment = function (comment) {
            this.myComment = comment;
            console.info('myComment', comment);
        }

        this.deleteCommentNow = function () {
            console.info('comment for delete', this.myComment);
            var status = Comments.remove(this.myComment._id);
            console.info('remove status', status);

            var selector = { postID: $stateParams.topicId };
            var modifier = {
                sort: this.sort
            };
            var comments = Comments.find(selector, modifier);
            var totalPosts = comments.count();

            console.info('totalPosts', totalPosts);

            if (totalPosts > 0) {
                comments.forEach(function (comment) {
                    $scope.latestComment = comment;
                });
                console.info('latestComment', $scope.latestComment);
                Meteor.call('upsertPost', $stateParams.topicId, $scope.latestComment.date, $scope.latestComment.name, $scope.latestComment.profilePhoto, totalPosts, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
            } else {
                var post = Posts.findOne({ _id: $stateParams.topicId });
                Meteor.call('upsertPost', $stateParams.topicId, post.datePosted, post.name, post.profilePhoto, totalPosts, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
            }

            this.myComment = {};
            $scope.latestComment = {};

            $('#modal-deleteComment').modal('hide');
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

const name = 'topic';

//Login.$inject = ['$scope', '$reactive', '$state'];

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    utilsPagination
]).component(name, {
    template,
    controllerAs: name,
    controller: ['$scope', '$reactive', '$stateParams', '$state', Topic]
})
    .config(['$stateProvider',
        function ($stateProvider) {
            //'ngInject';
            $stateProvider
                .state('topic', {
                    url: '/topic/:topicId',
                    template: '<topic></topic>',
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

