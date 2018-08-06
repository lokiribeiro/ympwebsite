import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

import '../../../startup/pages.js';

import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Projects } from '../../../api/projects';
import { Projectjobs } from '../../../api/projectjobs';
import { Docs } from '../../../api/docs';

import template from './projectdetails.html';

class Projectdetails {
    constructor($scope, $reactive, $stateParams, $state, Upload) {
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

        this.uploader = new Slingshot.Upload('myFileUploads');

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

        this.subscribe('projectjobs');

        this.subscribe('docs');

        this.helpers({
            project() {
                var selector = { _id: $stateParams.projectId };
                var projects = Projects.findOne(selector);
                console.info('poprojectssts', projects);
                return projects;
            },
            projectjobs() {
                var selector = { projectID: $stateParams.projectId };
                var projectjobs = Projectjobs.find(selector);
                console.info('projectjobs', projectjobs);
                return projectjobs;
            },
            docs() {
                var docs = Docs.find({
                    projectID: $stateParams.projectId
                });
                console.info('docs', docs);
                return docs;
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

        this.getjobID = function (job) {
            $scope.jobID = job._id;
            console.info('$scope.jobID', $scope.jobID);
        }

        this.saveChanges = function (job) {
            //$scope.editJobID = job._id;
            console.info('$scope.editJobID', job);
            if (job.name && job.description) {
                Meteor.call('updateProjectJob', job._id, job.name, job.description, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
                this.requiredFields = false;
                this.changesSaved = true;
                //window.scrollTo(0, 0);
            } else {
                this.requiredFields = true;
                //window.scrollTo(0, 0);
            }
            $('#modal-notify').modal('show');
        }

        this.saveProject = function () {
            //$scope.editJobID = job._id;
            if (this.project.name && this.project.details) {
                Meteor.call('updateProject', $stateParams.projectId, this.project.name, this.project.details, function (err, detail) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('success', detail);
                    }
                });
                $state.go('quotes', {}, { reload: 'quotes' });
                //window.scrollTo(0, 0);
            } else {
                this.requiredFields = true;
                $('#modal-notify').modal('show');
                //window.scrollTo(0, 0);
            }

        }

        this.uploadFile = function (file, errFiles) {
            console.info('pasok', file);
            this.progress = 0;
            this.uploadingNow = true;
            this.f = file;
            this.errFile = errFiles && errFiles[0];
            $scope.fileHere = file.name;
            this.profileID = Meteor.userId();
            $scope.doneSearching = true;
            $scope.uploadSuccess = false;
            if (file) {
                console.log(file);


                this.uploader.send(file, function (error, downloadUrl) {
                    if (error) {
                        // Log service detailed response.
                        console.error('Error uploading', this.uploader);
                        alert(error);
                    }
                    else {
                        var filename = this.fileHere;
                        var profileID = Meteor.userId();

                        Meteor.call('upsertQuoteFile', profileID, downloadUrl, $scope.jobID, $scope.fileHere, $stateParams.projectId, function (err, result) {
                            console.log(downloadUrl);
                            console.log('success: ' + downloadUrl);
                            if (err) {
                                console.info('err', err);
                                $scope.doneSearching = false;
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);

                            } else {
                                console.info('uploaded', err);
                                $scope.doneSearching = false;
                                console.info('doneSearching', $scope.doneSearching);
                                $scope.uploadSuccess = true;
                                $scope.countAllFiles();
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);
                            }
                        });
                    }
                });
                file.upload = Upload.upload({
                    url: '/uploads',
                    data: { file: file }
                });
                var filename = file.name;
                var path = '/uploads';
                var type = file.type;
                switch (type) {
                    case 'text':
                        //tODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
                        var method = 'readAsText';
                        var encoding = 'utf8';
                        break;
                    case 'binary':
                        var method = 'readAsBinaryString';
                        var encoding = 'binary';
                        break;
                    default:
                        var method = 'readAsBinaryString';
                        var encoding = 'binary';
                        break;
                }
                /*Meteor.call('uploadFileFromClient', filename, path, file, encoding, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('success maybe?');
                  }
                });*/


                file.upload.then(function (response) {
                    $timeout(function () {
                        console.log(response);
                        file.result = response.data;
                        this.Fresult = response.config.data.file;

                        var errs = 0;
                        var Fresult = this.Fresult;
                        console.info('this', Fresult);
                    });
                }, function (response) {
                    if (response.status > 0)
                        this.errorMsg = response.status + ': ' + response.data;
                    else {
                        console.log('else pa');
                    }
                }, function (event) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        event.loaded / event.total));
                    this.progress = file.progress;
                    if (this.progress == 100) {
                        this.uploadingNow = false;
                    }
                    console.log(this.progress);
                });

            }
        };

        $scope.countAllFiles = function () {
            console.log('count ng files');
            var selector = {
                $and: [
                    { projectjobID: $scope.jobID },
                    { projectID: $stateParams.projectId },
                    { fileType: 'quotefile' }
                ]
            };
            var files = Docs.find(selector);
            var filecount = files.count();
            console.info('filecount', filecount);

            Meteor.call('upsertTotalFile', $scope.jobID, filecount, function (err, result) {
                if (err) {
                    console.info('err', err);
                } else {
                    console.info('changed file count', err);
                }
            });

            var selector = { _id: $stateParams.projectId };
            var project = Projects.findOne(selector);
            var projectFiles = project.filecount;
            console.info('projectFiles', projectFiles);
            var projectFileCount = projectFiles + filecount;
            console.info('projectFileCount', projectFileCount);

            Meteor.call('upsertProjectFile', $stateParams.projectId, projectFileCount, function (err, result) {
                if (err) {
                    console.info('err', err);
                } else {
                    console.info('changed file count', err);
                }
            });

        }

        this.uploadImage = function (file, errFiles) {
            console.info('pasok', file);
            this.progress = 0;
            this.uploadingNow = true;
            this.f = file;
            this.errFile = errFiles && errFiles[0];
            $scope.fileHere = file.name;
            this.profileID = Meteor.userId();
            $scope.doneSearching = true;
            $scope.uploadSuccess = false;
            if (file) {
                console.log(file);


                this.uploader.send(file, function (error, downloadUrl) {
                    if (error) {
                        // Log service detailed response.
                        console.error('Error uploading', this.uploader);
                        alert(error);
                    }
                    else {
                        var filename = this.fileHere;
                        var profileID = Meteor.userId();

                        Meteor.call('upsertQuoteImage', profileID, downloadUrl, $scope.jobID, $scope.fileHere, $stateParams.projectId, function (err, result) {
                            console.log(downloadUrl);
                            console.log('success: ' + downloadUrl);
                            if (err) {
                                console.info('err', err);
                                $scope.doneSearching = false;
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);

                            } else {
                                console.info('uploaded', err);
                                $scope.doneSearching = false;
                                console.info('doneSearching', $scope.doneSearching);
                                $scope.uploadSuccess = true;
                                $scope.countAllImages();
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);
                            }
                        });
                    }
                });
                file.upload = Upload.upload({
                    url: '/uploads',
                    data: { file: file }
                });
                var filename = file.name;
                var path = '/uploads';
                var type = file.type;
                switch (type) {
                    case 'text':
                        //tODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
                        var method = 'readAsText';
                        var encoding = 'utf8';
                        break;
                    case 'binary':
                        var method = 'readAsBinaryString';
                        var encoding = 'binary';
                        break;
                    default:
                        var method = 'readAsBinaryString';
                        var encoding = 'binary';
                        break;
                }
                /*Meteor.call('uploadFileFromClient', filename, path, file, encoding, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('success maybe?');
                  }
                });*/


                file.upload.then(function (response) {
                    $timeout(function () {
                        console.log(response);
                        file.result = response.data;
                        this.Fresult = response.config.data.file;

                        var errs = 0;
                        var Fresult = this.Fresult;
                        console.info('this', Fresult);
                    });
                }, function (response) {
                    if (response.status > 0)
                        this.errorMsg = response.status + ': ' + response.data;
                    else {
                        console.log('else pa');
                    }
                }, function (event) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        event.loaded / event.total));
                    this.progress = file.progress;
                    if (this.progress == 100) {
                        this.uploadingNow = false;
                    }
                    console.log(this.progress);
                });

            }
        };

        $scope.countAllImages = function () {
            console.log('count ng images');
            var selector = {
                $and: [
                    { projectjobID: $scope.jobID },
                    { projectID: $stateParams.projectId },
                    { fileType: 'quoteimage' }
                ]
            };
            var files = Docs.find(selector);
            var filecount = files.count();
            console.info('filecount', filecount);

            Meteor.call('upsertTotalImage', $scope.jobID, filecount, function (err, result) {
                if (err) {
                    console.info('err', err);
                } else {
                    console.info('changed image count', err);
                }
            });

            var selector = { _id: $stateParams.projectId };
            var project = Projects.findOne(selector);
            var projectFiles = project.imagecount;
            console.info('projectImage', projectFiles);
            var projectFileCount = projectFiles + 1;
            console.info('projectImageCount', projectFileCount);

            Meteor.call('upsertProjectImage', $stateParams.projectId, projectFileCount, function (err, result) {
                if (err) {
                    console.info('err', err);
                } else {
                    console.info('changed file count', err);
                }
            });

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

        this.deleteJob = function (job) {
            this.jobForDelete = job;
            console.info('jobForDelete', job);
        }

        this.deleteJobNow = function () {
            console.info('jobForDelete', this.jobForDelete);
            var status = Projectjobs.remove(this.jobForDelete._id);
            console.info('remove status', status);
            this.jobForDelete = {};

            $('#modal-deleteJob').modal('hide');
        }

        this.deleteProjectNow = function () {
            var selector = {projectID: $stateParams.projectId};
            var projectjobs = Projectjobs.find(selector);
            projectjobs.forEach(function(projectjob){
                var status = Projectjobs.remove(projectjob._id);
                console.info('remove job status', status);
            });
            var status = Projects.remove($stateParams.projectId);
            console.info('remove status', status);

            $('#modal-deleteProject').modal('hide');
            angular.element("body").removeClass("modal-open");
            var removeMe = angular.element(document.getElementsByClassName("modal-backdrop"));
            removeMe.remove();
            $state.go('quotes', {}, { reload: 'quotes' });
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

const name = 'projectdetails';

//Login.$inject = ['$scope', '$reactive', '$state'];

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    utilsPagination
]).component(name, {
    template,
    controllerAs: name,
    controller: ['$scope', '$reactive', '$stateParams', '$state', 'Upload', Projectdetails]
})
    .config(['$stateProvider',
        function ($stateProvider) {
            //'ngInject';
            $stateProvider
                .state('projectdetails', {
                    url: '/projectdetails/:projectId',
                    template: '<projectdetails></projectdetails>',
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

