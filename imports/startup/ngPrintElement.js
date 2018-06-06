(function (angular) {
    'use strict';

    var mod = angular.module('ngPrintElement', []);

    function printDirective() {
        var printSection = document.getElementById('printSection');

        // if there is no printing section, create one
        if (!printSection) {
            printSection = document.createElement('div');
            printSection.id = 'printSection';
            document.body.appendChild(printSection);
        }

        function link(scope, element, attrs) {
            element.on('click', function () {
                var elemToPrint = document.getElementById(attrs.printElementId);
                if (elemToPrint) {
                    printElement(elemToPrint);
                }
            });

            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function(mql) {
                    if (!mql.matches) {
                        afterPrint();
                    } else {
                        // before print (currently does nothing)
                    }
                });
            }

            window.onafterprint = afterPrint;
        }

        function afterPrint() {
            // clean the print section before adding new content
            printSection.innerHTML = '';
        }

        function printElement(elem) {
            // clones the element you want to print
            var domClone = elem.cloneNode(true);
            printSection.innerHTML = '';
            console.info('printSection innerhtml init', printSection);
            printSection.appendChild(domClone);
            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
            var file = printWindow.document.createElement("link");
            file.setAttribute("rel", "stylesheet");
            file.setAttribute("type", "text/css");
            file.setAttribute("href", 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css');
            printWindow.document.head.appendChild(file);
            printWindow.document.body.innerHTML = '';
            printWindow.document.body.appendChild(domClone);
            console.info('printWindow', printWindow);
            printWindow.document.close();
            printWindow.setTimeout(function(){
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000);
        }

        return {
            link: link,
            restrict: 'A'
        };
    }

    mod.directive('ngPrintElement', [printDirective]);
}(window.angular));