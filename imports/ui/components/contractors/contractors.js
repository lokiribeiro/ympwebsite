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
import { Profiles } from '../../../api/profiles';
import { Quotes } from '../../../api/quotes';

import template from './contractors.html';

class Contractors {
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
        this.quote = {};
        this.searchText = '';

        this.comment = {};
        this.myComment = {};
        $scope.latestComment = {};
        this.required = false;
        this.requiredFields = false;
        this.changesSaved = false;
        this.jobIsAdded = false;
        this.notification = '';
        $scope.messageNotSent = false;
        $scope.messageSent = false;
        $scope.noEmail = false;
        $scope.emailStatus = '';
        $scope.subCategory = '';

        this.captainSub = false;
        this.mateSub = false;
        this.engineerSub = false;
        this.stewardessesSub = false;
        this.chefSub = false;
        this.mainCategory = true;

        this.countryLists = [
            {Code: "AF", Name: "Afghanistan"},
            {Code: "AX", Name: "\u00c5land Islands"},
            {Code: "AL", Name: "Albania"},
            {Code: "DZ", Name: "Algeria"},
            {Code: "AS", Name: "American Samoa"},
            {Code: "AD", Name: "Andorra"},
            {Code: "AO", Name: "Angola"},
            {Code: "AI", Name: "Anguilla"},
            {Code: "AQ", Name: "Antarctica"},
            {Code: "AG", Name: "Antigua and Barbuda"},
            {Code: "AR", Name: "Argentina"},
            {Code: "AM", Name: "Armenia"},
            {Code: "AW", Name: "Aruba"},
            {Code: "AU", Name: "Australia"},
            {Code: "AT", Name: "Austria"},
            {Code: "AZ", Name: "Azerbaijan"},
            {Code: "BS", Name: "Bahamas"},
            {Code: "BH", Name: "Bahrain"},
            {Code: "BD", Name: "Bangladesh"},
            {Code: "BB", Name: "Barbados"},
            {Code: "BY", Name: "Belarus"},
            {Code: "BE", Name: "Belgium"},
            {Code: "BZ", Name: "Belize"},
            {Code: "BJ", Name: "Benin"},
            {Code: "BM", Name: "Bermuda"},
            {Code: "BT", Name: "Bhutan"},
            {Code: "BO", Name: "Bolivia, Plurinational State of"},
            {Code: "BQ", Name: "Bonaire, Sint Eustatius and Saba"},
            {Code: "BA", Name: "Bosnia and Herzegovina"},
            {Code: "BW", Name: "Botswana"},
            {Code: "BV", Name: "Bouvet Island"},
            {Code: "BR", Name: "Brazil"},
            {Code: "IO", Name: "British Indian Ocean Territory"},
            {Code: "BN", Name: "Brunei Darussalam"},
            {Code: "BG", Name: "Bulgaria"},
            {Code: "BF", Name: "Burkina Faso"},
            {Code: "BI", Name: "Burundi"},
            {Code: "KH", Name: "Cambodia"},
            {Code: "CM", Name: "Cameroon"},
            {Code: "CA", Name: "Canada"},
            {Code: "CV", Name: "Cape Verde"},
            {Code: "KY", Name: "Cayman Islands"},
            {Code: "CF", Name: "Central African Republic"},
            {Code: "TD", Name: "Chad"},
            {Code: "CL", Name: "Chile"},
            {Code: "CN", Name: "China"},
            {Code: "CX", Name: "Christmas Island"},
            {Code: "CC", Name: "Cocos (Keeling) Islands"},
            {Code: "CO", Name: "Colombia"},
            {Code: "KM", Name: "Comoros"},
            {Code: "CG", Name: "Congo"},
            {Code: "CD", Name: "Congo, the Democratic Republic of the"},
            {Code: "CK", Name: "Cook Islands"},
            {Code: "CR", Name: "Costa Rica"},
            {Code: "CI", Name: "C\u00f4te d'Ivoire"},
            {Code: "HR", Name: "Croatia"},
            {Code: "CU", Name: "Cuba"},
            {Code: "CW", Name: "Cura\u00e7ao"},
            {Code: "CY", Name: "Cyprus"},
            {Code: "CZ", Name: "Czech Republic"},
            {Code: "DK", Name: "Denmark"},
            {Code: "DJ", Name: "Djibouti"},
            {Code: "DM", Name: "Dominica"},
            {Code: "DO", Name: "Dominican Republic"},
            {Code: "EC", Name: "Ecuador"},
            {Code: "EG", Name: "Egypt"},
            {Code: "SV", Name: "El Salvador"},
            {Code: "GQ", Name: "Equatorial Guinea"},
            {Code: "ER", Name: "Eritrea"},
            {Code: "EE", Name: "Estonia"},
            {Code: "ET", Name: "Ethiopia"},
            {Code: "FK", Name: "Falkland Islands (Malvinas)"},
            {Code: "FO", Name: "Faroe Islands"},
            {Code: "FJ", Name: "Fiji"},
            {Code: "FI", Name: "Finland"},
            {Code: "FR", Name: "France"},
            {Code: "GF", Name: "French Guiana"},
            {Code: "PF", Name: "French Polynesia"},
            {Code: "TF", Name: "French Southern Territories"},
            {Code: "GA", Name: "Gabon"},
            {Code: "GM", Name: "Gambia"},
            {Code: "GE", Name: "Georgia"},
            {Code: "DE", Name: "Germany"},
            {Code: "GH", Name: "Ghana"},
            {Code: "GI", Name: "Gibraltar"},
            {Code: "GR", Name: "Greece"},
            {Code: "GL", Name: "Greenland"},
            {Code: "GD", Name: "Grenada"},
            {Code: "GP", Name: "Guadeloupe"},
            {Code: "GU", Name: "Guam"},
            {Code: "GT", Name: "Guatemala"},
            {Code: "GG", Name: "Guernsey"},
            {Code: "GN", Name: "Guinea"},
            {Code: "GW", Name: "Guinea-Bissau"},
            {Code: "GY", Name: "Guyana"},
            {Code: "HT", Name: "Haiti"},
            {Code: "HM", Name: "Heard Island and McDonald Islands"},
            {Code: "VA", Name: "Holy See (Vatican City State)"},
            {Code: "HN", Name: "Honduras"},
            {Code: "HK", Name: "Hong Kong"},
            {Code: "HU", Name: "Hungary"},
            {Code: "IS", Name: "Iceland"},
            {Code: "IN", Name: "India"},
            {Code: "ID", Name: "Indonesia"},
            {Code: "IR", Name: "Iran, Islamic Republic of"},
            {Code: "IQ", Name: "Iraq"},
            {Code: "IE", Name: "Ireland"},
            {Code: "IM", Name: "Isle of Man"},
            {Code: "IL", Name: "Israel"},
            {Code: "IT", Name: "Italy"},
            {Code: "JM", Name: "Jamaica"},
            {Code: "JP", Name: "Japan"},
            {Code: "JE", Name: "Jersey"},
            {Code: "JO", Name: "Jordan"},
            {Code: "KZ", Name: "Kazakhstan"},
            {Code: "KE", Name: "Kenya"},
            {Code: "KI", Name: "Kiribati"},
            {Code: "KP", Name: "Korea, Democratic People's Republic of"},
            {Code: "KR", Name: "Korea, Republic of"},
            {Code: "KW", Name: "Kuwait"},
            {Code: "KG", Name: "Kyrgyzstan"},
            {Code: "LA", Name: "Lao People's Democratic Republic"},
            {Code: "LV", Name: "Latvia"},
            {Code: "LB", Name: "Lebanon"},
            {Code: "LS", Name: "Lesotho"},
            {Code: "LR", Name: "Liberia"},
            {Code: "LY", Name: "Libya"},
            {Code: "LI", Name: "Liechtenstein"},
            {Code: "LT", Name: "Lithuania"},
            {Code: "LU", Name: "Luxembourg"},
            {Code: "MO", Name: "Macao"},
            {Code: "MK", Name: "Macedonia, the Former Yugoslav Republic of"},
            {Code: "MG", Name: "Madagascar"},
            {Code: "MW", Name: "Malawi"},
            {Code: "MY", Name: "Malaysia"},
            {Code: "MV", Name: "Maldives"},
            {Code: "ML", Name: "Mali"},
            {Code: "MT", Name: "Malta"},
            {Code: "MH", Name: "Marshall Islands"},
            {Code: "MQ", Name: "Martinique"},
            {Code: "MR", Name: "Mauritania"},
            {Code: "MU", Name: "Mauritius"},
            {Code: "YT", Name: "Mayotte"},
            {Code: "MX", Name: "Mexico"},
            {Code: "FM", Name: "Micronesia, Federated States of"},
            {Code: "MD", Name: "Moldova, Republic of"},
            {Code: "MC", Name: "Monaco"},
            {Code: "MN", Name: "Mongolia"},
            {Code: "ME", Name: "Montenegro"},
            {Code: "MS", Name: "Montserrat"},
            {Code: "MA", Name: "Morocco"},
            {Code: "MZ", Name: "Mozambique"},
            {Code: "MM", Name: "Myanmar"},
            {Code: "NA", Name: "Namibia"},
            {Code: "NR", Name: "Nauru"},
            {Code: "NP", Name: "Nepal"},
            {Code: "NL", Name: "Netherlands"},
            {Code: "NC", Name: "New Caledonia"},
            {Code: "NZ", Name: "New Zealand"},
            {Code: "NI", Name: "Nicaragua"},
            {Code: "NE", Name: "Niger"},
            {Code: "NG", Name: "Nigeria"},
            {Code: "NU", Name: "Niue"},
            {Code: "NF", Name: "Norfolk Island"},
            {Code: "MP", Name: "Northern Mariana Islands"},
            {Code: "NO", Name: "Norway"},
            {Code: "OM", Name: "Oman"},
            {Code: "PK", Name: "Pakistan"},
            {Code: "PW", Name: "Palau"},
            {Code: "PS", Name: "Palestine, State of"},
            {Code: "PA", Name: "Panama"},
            {Code: "PG", Name: "Papua New Guinea"},
            {Code: "PY", Name: "Paraguay"},
            {Code: "PE", Name: "Peru"},
            {Code: "PH", Name: "Philippines"},
            {Code: "PN", Name: "Pitcairn"},
            {Code: "PL", Name: "Poland"},
            {Code: "PT", Name: "Portugal"},
            {Code: "PR", Name: "Puerto Rico"},
            {Code: "QA", Name: "Qatar"},
            {Code: "RE", Name: "R\u00e9union"},
            {Code: "RO", Name: "Romania"},
            {Code: "RU", Name: "Russian Federation"},
            {Code: "RW", Name: "Rwanda"},
            {Code: "BL", Name: "Saint Barth\u00e9lemy"},
            {Code: "SH", Name: "Saint Helena, Ascension and Tristan da Cunha"},
            {Code: "KN", Name: "Saint Kitts and Nevis"},
            {Code: "LC", Name: "Saint Lucia"},
            {Code: "MF", Name: "Saint Martin (French part)"},
            {Code: "PM", Name: "Saint Pierre and Miquelon"},
            {Code: "VC", Name: "Saint Vincent and the Grenadines"},
            {Code: "WS", Name: "Samoa"},
            {Code: "SM", Name: "San Marino"},
            {Code: "ST", Name: "Sao Tome and Principe"},
            {Code: "SA", Name: "Saudi Arabia"},
            {Code: "SN", Name: "Senegal"},
            {Code: "RS", Name: "Serbia"},
            {Code: "SC", Name: "Seychelles"},
            {Code: "SL", Name: "Sierra Leone"},
            {Code: "SG", Name: "Singapore"},
            {Code: "SX", Name: "Sint Maarten (Dutch part)"},
            {Code: "SK", Name: "Slovakia"},
            {Code: "SI", Name: "Slovenia"},
            {Code: "SB", Name: "Solomon Islands"},
            {Code: "SO", Name: "Somalia"},
            {Code: "ZA", Name: "South Africa"},
            {Code: "GS", Name: "South Georgia and the South Sandwich Islands"},
            {Code: "SS", Name: "South Sudan"},
            {Code: "ES", Name: "Spain"},
            {Code: "LK", Name: "Sri Lanka"},
            {Code: "SD", Name: "Sudan"},
            {Code: "SR", Name: "Suriname"},
            {Code: "SJ", Name: "Svalbard and Jan Mayen"},
            {Code: "SZ", Name: "Swaziland"},
            {Code: "SE", Name: "Sweden"},
            {Code: "CH", Name: "Switzerland"},
            {Code: "SY", Name: "Syrian Arab Republic"},
            {Code: "TW", Name: "Taiwan, Province of China"},
            {Code: "TJ", Name: "Tajikistan"},
            {Code: "TZ", Name: "Tanzania, United Republic of"},
            {Code: "TH", Name: "Thailand"},
            {Code: "TL", Name: "Timor-Leste"},
            {Code: "TG", Name: "Togo"},
            {Code: "TK", Name: "Tokelau"},
            {Code: "TO", Name: "Tonga"},
            {Code: "TT", Name: "Trinidad and Tobago"},
            {Code: "TN", Name: "Tunisia"},
            {Code: "TR", Name: "Turkey"},
            {Code: "TM", Name: "Turkmenistan"},
            {Code: "TC", Name: "Turks and Caicos Islands"},
            {Code: "TV", Name: "Tuvalu"},
            {Code: "UG", Name: "Uganda"},
            {Code: "UA", Name: "Ukraine"},
            {Code: "AE", Name: "United Arab Emirates"},
            {Code: "GB", Name: "United Kingdom"},
            {Code: "US", Name: "United States"},
            {Code: "UM", Name: "United States Minor Outlying Islands"},
            {Code: "UY", Name: "Uruguay"},
            {Code: "UZ", Name: "Uzbekistan"},
            {Code: "VU", Name: "Vanuatu"},
            {Code: "VE", Name: "Venezuela, Bolivarian Republic of"},
            {Code: "VN", Name: "Viet Nam"},
            {Code: "VG", Name: "Virgin Islands, British"},
            {Code: "VI", Name: "Virgin Islands, U.S."},
            {Code: "WF", Name: "Wallis and Futuna"},
            {Code: "EH", Name: "Western Sahara"},
            {Code: "YE", Name: "Yemen"},
            {Code: "ZM", Name: "Zambia"},
            {Code: "ZW", Name: "Zimbabwe"}];

        this.captainCategories = [
            {name: 'Travel Agents'},
            {name: 'Yacht Transport & Delivery'},
            {name: 'Project Management & Owners Reps'},
            {name: 'Composite Services'},
            {name: 'Maritime Security'},
            {name: 'Port, Marina & Dock Equipment'},
            {name: 'Shipyards - New Construction'},
            {name: 'Shipyards - Refit & Repair'},
            {name: 'Berths'},
            {name: 'Rental'},
            {name: 'Chandlers'},
            {name: 'Chandlers'},
            {name: 'Fuel Bunkering & Additives'},
            {name: 'Yacht Agents'},
            {name: 'Yacht Designers'},
            {name: 'Yacht Management & ISM'},
            {name: 'Fuel Bunkering & Additives'}
        ];

        this.mateCategories = [
            {name: 'Fuel Bunkering & Additives'},
            {name: 'Yacht Agents'},
            {name: 'Travel Agents'},
            {name: 'Photographers'},
            {name: 'Accommodation'},
            {name: 'Berths'},
            {name: 'Rental'},
            {name: 'Chandlers'},
            {name: 'Entertainment & Event Management'},
            {name: 'Cleaning & Painting'},
            {name: 'Carpenters & Joiners'},
            {name: 'Medical Supplies & Services'},
            {name: 'Carpets & Flooring'},
            {name: 'Lights & Lighting'},
            {name: 'Upholstery & Fabrics'},
            {name: 'Awnings, Canopies & Covers'},
            {name: 'Doors & Hatches'},
            {name: 'Fenders & Fender Covers'},
            {name: 'Passerelles & Boarding Systems'},
            {name: 'Sailing & Rigging'},
            {name: 'Yacht Signs'},
            {name: 'Refit & Repair'},
            {name: 'Fire & Safety Equipment'},
            {name: 'Shipyards - New Construction'},
            {name: 'Shipyards - Refit & Repair'},
            {name: 'Fuel Bunkering & Additives'},
            {name: 'Tenders & Toys'},
            {name: 'Limousines & Car Hire'},
            {name: 'Marine Electronics'},
            {name: 'Navigation Charts & Equipment'},
            {name: 'Entertainment & AV Systems '},
            {name: 'Satellite Communications'}
        ];

        this.engineerCategories = [
            {name: 'Fuel Bunkering & Additives'},
            {name: 'Yacht Agents'},
            {name: 'Travel Agents'},
            {name: 'Rental'},
            {name: 'Chandlers'},
            {name: 'Davits & Hydraulics'},
            {name: 'Electrical'},
            {name: 'Electronic/AV/IT'},
            {name: 'Engine Service'},
            {name: 'Metal Works, Fabrication & Supply'},
            {name: 'Generators & Power Management'},
            {name: 'HVAC & Refrigeration'},
            {name: 'Lifts & Elevators'},
            {name: 'Propellers & Propulsion'},
            {name: 'Stabilizers'},
            {name: 'Water Treatment'},
            {name: 'Lights & Lighting'},
            {name: 'Refit & Repair'},
            {name: 'Shipyards - New Construction'},
            {name: 'Shipyards - Refit & Repair'},
            {name: 'Fuel Bunkering & Additives'},
            {name: 'Entertainment & AV Systems'},
            {name: 'Marine Electronics'},
            {name: 'Satellite Communications'}
        ];

        this.stewardessesCategories = [
            {name: 'Yacht Agents'},
            {name: 'Travel Agents'},
            {name: 'Florists'},
            {name: 'Rental'},
            {name: 'Chandlers'},
            {name: 'Entertainment & Event Management'},
            {name: 'Uniforms & Clothing'},
            {name: 'Hair & Beauty'},
            {name: 'Massage Therapy'},
            {name: 'Galley & Catering Equipment'},
            {name: 'Provisioning'},
            {name: 'Glass Suppliers & Services'},
            {name: 'Medical Supplies & Services'},
            {name: 'Wine, Spirits & Soft Drinks'},
            {name: 'Bathrooms & Spas'},
            {name: 'Beds & Linen Suppliers'}, 
            {name: 'Carpets & Flooring'},
            {name: 'Interior Design'},
            {name: 'Furniture & Furnishings'}, 
            {name: 'Lights & Lighting'},
            {name: 'Toiletries'},
            {name: 'Upholstery & Fabrics'},
            {name: 'Tableware'},
            {name: 'Awnings, Canopies & Covers'},
            {name: 'Laundry Equipment & Services'},
            {name: 'Luxury Goods'},
            {name: 'Pet Services'},
            {name: 'Limousines & Car Hire'}
        ];

        this.chefCategories = [
            {name: 'Yacht Agents'},
            {name: 'Travel Agents'},
            {name: 'Galley & Catering Equipment'}, 
            {name: 'Provisioning'}
        ];
        

        this.subscribe('users');

        this.subscribe('projects');

        this.subscribe('projectjobs');

        this.subscribe('docs');

        this.subscribe('profiles');

        this.subscribe('quotes');

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
        this.selectSubCategory = function(sub) {
            $scope.subCategory = sub;
        }
        this.gotoCaptainSub = function() {
            this.captainSub = true;
            this.mainCategory = false;
            this.mateSub = false;
            this.engineerSub = false;
            this.stewardessesSub = false;
            this.chefSub = false;
        }
        this.gotoMatesSub = function() {
            this.captainSub = false;
            this.mainCategory = false;
            this.mateSub = true;
            this.engineerSub = false;
            this.stewardessesSub = false;
            this.chefSub = false;
        }
        this.gotoEngineerSub = function() {
            this.captainSub = false;
            this.mainCategory = false;
            this.mateSub = false;
            this.engineerSub = true;
            this.stewardessesSub = false;
            this.chefSub = false;
        }
        this.gotoStewardessesSub = function() {
            this.captainSub = false;
            this.mainCategory = false;
            this.mateSub = false;
            this.engineerSub = false;
            this.stewardessesSub = true;
            this.chefSub = false;
        }
        this.gotoChefSub = function() {
            this.captainSub = false;
            this.mainCategory = false;
            this.mateSub = false;
            this.engineerSub = false;
            this.stewardessesSub = false;
            this.chefSub = true;
        }
        this.gotoMainCategory = function() {
            this.captainSub = false;
            this.mainCategory = true;
            this.mateSub = false;
            this.engineerSub = false;
            this.stewardessesSub = false;
            this.chefSub = false;
        }

        this.submit = function () {
            console.info('submitted post', this.quote);
            if (this.quote.message) {
                this.notification = '';
                this.quote.projectID = $stateParams.projectId;
                this.quote.from = Meteor.userId();
                $scope.quoteUserID = this.quote.from;
                console.info('from quote', this.quote.from);
                this.quote.date = new Date();
                this.quote.dateTime = this.quote.date.getTime();
                var users = Meteor.user();
                console.info('users', users);
                this.quote.fromName = users.username;
                this.quote.jobtitle = users.jobtitle;
                this.quote.profilePhoto = users.profilePhoto;
                this.quote.status = true;

                var selector = { userID: this.quote.from };
                var profiles = Profiles.find(selector);
                profiles.forEach(function (profile) {
                    $scope.fullName = profile.firstName + ' ' + profile.lastName;
                    if (profile.userID == $scope.quoteUserID) {
                        try {
                            if (profile.email) {
                                $scope.quoteEmail = profile.email;
                            } else {
                                $scope.quoteEmail = 'none'
                            }
                        } catch (err) {
                            $scope.quoteEmail = 'none'
                        }
                    }
                })
                console.info('profile details', $scope.quoteEmail);
                if (this.project.email == 'none') {
                    this.quote.fromEmail = 'Email not sent. Project owner missing email in account profile.';
                    this.notification = this.quote.fromEmail;
                    $scope.noEmail = true;
                    window.setTimeout(function () {
                        $scope.$apply();
                        //this.doneSearching = false;
                    }, 2000);
                } else {
                    if ($scope.quoteEmail == 'none') {
                        this.quote.fromEmail = 'Email not sent. Sender missing email in account profile.';
                        this.notification = this.quote.fromEmail;
                        $scope.noEmail = true;
                        window.setTimeout(function () {
                            $scope.$apply();
                            //this.doneSearching = false;
                        }, 2000);
                    } else {
                        this.quote.fromEmail = $scope.quoteEmail;
                        var messageBody = "<html><div>Project Details:</div><br /><p><b>Project Name: </b>" +
                            this.project.name +
                            " <br /><b>Project Code: </b>" +
                            this.project.projectCode +
                            " <br /><b>Message: </b><br />" +
                            this.quote.message +
                            " <br /></p></html>";
                        var toEmail = this.project.email;
                        var toName = this.project.ownerName;
                        var fromEmail = this.quote.fromEmail;
                        var fromName = this.quote.fromName;

                        Meteor.call('sendEmail', toEmail, toName, messageBody, fromEmail, fromName, function (err, result) {
                            if (err) {
                                $scope.messageNotSent = true;
                                $scope.emailStatus = err.message;
                                console.info('error', err);
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);
                            } else {
                                $scope.messageSent = true;
                                console.info('result', result);
                                window.setTimeout(function () {
                                    $scope.$apply();
                                    //this.doneSearching = false;
                                }, 2000);
                            }
                        });
                    }
                }

                this.quote.fullName = $scope.fullName;

                var status = Quotes.insert(this.quote);
                console.info('status', status);

                var selector = { _id: $stateParams.projectId };
                var project = Projects.findOne(selector);
                var projectFiles = project.quotecount;
                console.info('projectQuote', projectFiles);
                var projectFileCount = projectFiles + 1;
                console.info('projectQuoteCount', projectFileCount);

                Meteor.call('upsertProjectQuote', $stateParams.projectId, projectFileCount, function (err, result) {
                    if (err) {
                        console.info('err', err);
                    } else {
                        console.info('changed file count', err);
                    }
                });

                this.required = false;
                this.jobIsAdded = true;
                this.quote = {};
                $scope.quoteUserID = '';
                $scope.quoteEmail = '';
                $scope.fullName = '';

                /*var selector = { _id: $stateParams.projectId };
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
                });*/
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
            var selector = { projectID: $stateParams.projectId };
            var projectjobs = Projectjobs.find(selector);
            projectjobs.forEach(function (projectjob) {
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
            $scope.messageNotSent = false;
            $scope.messageSent = false;
            $scope.noEmail = false;
        }


    }

    pageChanged(newPage) {
        this.page = newPage;
        console.info('new page', this.page);
    }


}

const name = 'contractors';

//Login.$inject = ['$scope', '$reactive', '$state'];

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    utilsPagination
]).component(name, {
    template,
    controllerAs: name,
    controller: ['$scope', '$reactive', '$stateParams', '$state', 'Upload', Contractors]
})
    .config(['$stateProvider',
        function ($stateProvider) {
            //'ngInject';
            $stateProvider
                .state('contractors', {
                    url: '/contractors',
                    template: '<contractors></contractors>',
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

