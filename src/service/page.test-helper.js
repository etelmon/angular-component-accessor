

angular
    .module('component-accessor')
    .factory('pageHelper', service);

function service($compile, $rootScope) {

    return {
        buildPage: buildPage,
        getAccessorsClass: getAccessorsClass
    };

    ////////////////////////////////
    /**
            * Use this to manually create directives for testing. This only creates the directive. Methods to access and manipulate it should be in a
            * page accessor object corresponding to the directive. 
            * 
            * check zGrid.directive.spec.js,   and its accessors zGridAccessors
            *
            * @param {Object} set of options used to configure directive construction:
            * 
            *        {String} html (required) The HTML used to construct the directive.
            *        {Object} accessors class which should define all methods to access html elements made available after compilation of the code
            *        {Object} scope (optional) The scope to construct the directive element with. This is not the directive scope.
            *        {String} vm (optional) the name of the controller in this page. 
            * 
            * @return {object} The constructed page. Exposes:
            *         {Object} element : The compiled directive element.
            *         {Object} scope : The scope of the compiled directive.
            *         {methods} all accessors are accessible from this page object directly.
            *         
            */
    function buildPage(options, noDigest) {
        // only create the vm if it does not exist
        if (options.vm && !options.scope[options.vm]) {
            options.scope[options.vm] = {};
        }


        var element = $('<div>');
        element.append(options.html);

        $compile(element)(options.scope);

        if (!noDigest) {
            options.scope.$digest();
        }

        var page = {
            element: element,
            scope: options.scope,
            $digest: function (debug) {
                options.scope.$digest();
                if (debug) {
                    page.print();
                }
            },
            print: function () {
                console.log('----------------------- P A G E --------------------------');
                console.log($('<div>').append(element).clone().html());
                console.log('----------------------------------------------------------');
            }
        };

        if (options.vm) {
            page[options.vm] = page.scope[options.vm];
        }

        return _.assign(page, new options.accessors(element));
    };


    function getAccessorsClass() {
        return function Accessors(element) {
            var parentAccessor;
            var self = this;
            var api = {
                find: find,
                exists: exists,
                click: click,
                getHtml: getHtml
            };

            this.add = add;
            this.extend = extend;
            this.do = doFn;
            this.getElement = getElement;
            this.setParentAccessor = setParentAccessor;


            /**
             * 
             * @param apiFunctionName, one of the api function (find,exists...)
             * @param locator,  jquery selector
             * @param includeElement, by default only search among the descendants, excluding parent.
             * 
             * @returns a function to that would run the selected action function on its query selector when called;
             */

            function doFn(apiFunctionName, locator, includeElement) {
                return function () {
                    if (!api[apiFunctionName]) {
                        throw new Error('Test function [' + apiFunctionName + '] does not exist.');
                    }
                    return api[apiFunctionName](locator, includeElement);
                }
            }

            function click(locator, includeElement) {
                return function () {
                    var el = this.find(locator, includeElement);
                    if (!el.length) {
                        throw new Error('Clickable element [' + locator + '] not found.');
                    }
                    return el;
                }
            }

            function existsFn(locator, includeElement) {
                return function () {
                    return this.exists(locator, includeElement);
                }
            }

            function exists(locator, includeElement) {
                return !!find(locator, includeElement).length;
            }

            function getHtml(locator, includeElement) {
                return find(locator, includeElement).html();
            }

            function getElement() {
                if (parentAccessor) {
                    return parentAccessor.getElement().find(element);
                } else {
                    return element;
                }
            }

            function setParentAccessor(accessor) {
                parentAccessor = accessor;
            }

            function add(childElementLocation, ChildElementAccessorsClass) {
                var acc = new ChildElementAccessorsClass(childElementLocation);
                acc.setParentAccessor(self);
                return acc;
            }

            function extend(ExtensionClass) {
                _.assign(this, new ExtensionClass(getElement()));
            }

            function find(locator, includeElement) {
                if (includeElement) {
                    // find locator in this this element and among descendants
                    var parentLocator = getElement().attr("class").split(' ').join('.');
                    if (parentLocator !== '') {
                        locator = '.' + parentLocator + locator;
                    }
                    return getElement().parent().find(locator);
                }
                else {
                    // find among descendants only
                    return getElement().find(locator);;
                }
            }
        }
    }



};
