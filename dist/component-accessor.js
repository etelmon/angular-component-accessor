(function() {
"use strict";

angular
    .module('component-accessor', []);
}());

(function() {
"use strict";

service.$inject = ["$compile", "$rootScope"];
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
}());


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudC1hY2Nlc3Nvci5qcyIsIi9zb3VyY2UvY29tcG9uZW50LWFjY2Vzc29yLm1vZHVsZS5qcyIsIi9zb3VyY2Uvc2VydmljZS9wYWdlLnRlc3QtaGVscGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsV0FBVztBQUNaOztBQ0RBO0tBQ0EsT0FBQSxzQkFBQTs7O0FETUEsQ0FBQyxXQUFXO0FBQ1o7OztBRU5BO0tBQ0EsT0FBQTtLQUNBLFFBQUEsY0FBQTs7QUFFQSxTQUFBLFFBQUEsVUFBQSxZQUFBOztJQUVBLE9BQUE7UUFDQSxXQUFBO1FBQ0EsbUJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBdUJBLFNBQUEsVUFBQSxTQUFBLFVBQUE7O1FBRUEsSUFBQSxRQUFBLE1BQUEsQ0FBQSxRQUFBLE1BQUEsUUFBQSxLQUFBO1lBQ0EsUUFBQSxNQUFBLFFBQUEsTUFBQTs7OztRQUlBLElBQUEsVUFBQSxFQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7O1FBRUEsU0FBQSxTQUFBLFFBQUE7O1FBRUEsSUFBQSxDQUFBLFVBQUE7WUFDQSxRQUFBLE1BQUE7OztRQUdBLElBQUEsT0FBQTtZQUNBLFNBQUE7WUFDQSxPQUFBLFFBQUE7WUFDQSxTQUFBLFVBQUEsT0FBQTtnQkFDQSxRQUFBLE1BQUE7Z0JBQ0EsSUFBQSxPQUFBO29CQUNBLEtBQUE7OztZQUdBLE9BQUEsWUFBQTtnQkFDQSxRQUFBLElBQUE7Z0JBQ0EsUUFBQSxJQUFBLEVBQUEsU0FBQSxPQUFBLFNBQUEsUUFBQTtnQkFDQSxRQUFBLElBQUE7Ozs7UUFJQSxJQUFBLFFBQUEsSUFBQTtZQUNBLEtBQUEsUUFBQSxNQUFBLEtBQUEsTUFBQSxRQUFBOzs7UUFHQSxPQUFBLEVBQUEsT0FBQSxNQUFBLElBQUEsUUFBQSxVQUFBO0tBQ0E7OztJQUdBLFNBQUEsb0JBQUE7UUFDQSxPQUFBLFNBQUEsVUFBQSxTQUFBO1lBQ0EsSUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLElBQUEsTUFBQTtnQkFDQSxNQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxTQUFBOzs7WUFHQSxLQUFBLE1BQUE7WUFDQSxLQUFBLFNBQUE7WUFDQSxLQUFBLEtBQUE7WUFDQSxLQUFBLGFBQUE7WUFDQSxLQUFBLG9CQUFBOzs7Ozs7Ozs7Ozs7WUFZQSxTQUFBLEtBQUEsaUJBQUEsU0FBQSxnQkFBQTtnQkFDQSxPQUFBLFlBQUE7b0JBQ0EsSUFBQSxDQUFBLElBQUEsa0JBQUE7d0JBQ0EsTUFBQSxJQUFBLE1BQUEsb0JBQUEsa0JBQUE7O29CQUVBLE9BQUEsSUFBQSxpQkFBQSxTQUFBOzs7O1lBSUEsU0FBQSxNQUFBLFNBQUEsZ0JBQUE7Z0JBQ0EsT0FBQSxZQUFBO29CQUNBLElBQUEsS0FBQSxLQUFBLEtBQUEsU0FBQTtvQkFDQSxJQUFBLENBQUEsR0FBQSxRQUFBO3dCQUNBLE1BQUEsSUFBQSxNQUFBLHdCQUFBLFVBQUE7O29CQUVBLE9BQUE7Ozs7WUFJQSxTQUFBLFNBQUEsU0FBQSxnQkFBQTtnQkFDQSxPQUFBLFlBQUE7b0JBQ0EsT0FBQSxLQUFBLE9BQUEsU0FBQTs7OztZQUlBLFNBQUEsT0FBQSxTQUFBLGdCQUFBO2dCQUNBLE9BQUEsQ0FBQSxDQUFBLEtBQUEsU0FBQSxnQkFBQTs7O1lBR0EsU0FBQSxRQUFBLFNBQUEsZ0JBQUE7Z0JBQ0EsT0FBQSxLQUFBLFNBQUEsZ0JBQUE7OztZQUdBLFNBQUEsYUFBQTtnQkFDQSxJQUFBLGdCQUFBO29CQUNBLE9BQUEsZUFBQSxhQUFBLEtBQUE7dUJBQ0E7b0JBQ0EsT0FBQTs7OztZQUlBLFNBQUEsa0JBQUEsVUFBQTtnQkFDQSxpQkFBQTs7O1lBR0EsU0FBQSxJQUFBLHNCQUFBLDRCQUFBO2dCQUNBLElBQUEsTUFBQSxJQUFBLDJCQUFBO2dCQUNBLElBQUEsa0JBQUE7Z0JBQ0EsT0FBQTs7O1lBR0EsU0FBQSxPQUFBLGdCQUFBO2dCQUNBLEVBQUEsT0FBQSxNQUFBLElBQUEsZUFBQTs7O1lBR0EsU0FBQSxLQUFBLFNBQUEsZ0JBQUE7Z0JBQ0EsSUFBQSxnQkFBQTs7b0JBRUEsSUFBQSxnQkFBQSxhQUFBLEtBQUEsU0FBQSxNQUFBLEtBQUEsS0FBQTtvQkFDQSxJQUFBLGtCQUFBLElBQUE7d0JBQ0EsVUFBQSxNQUFBLGdCQUFBOztvQkFFQSxPQUFBLGFBQUEsU0FBQSxLQUFBOztxQkFFQTs7b0JBRUEsT0FBQSxhQUFBLEtBQUEsU0FBQTs7Ozs7Ozs7Q0FRQTs7O0FGV0EiLCJmaWxlIjoiY29tcG9uZW50LWFjY2Vzc29yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmFuZ3VsYXJcbiAgICAubW9kdWxlKCdjb21wb25lbnQtYWNjZXNzb3InLCBbXSk7XG59KCkpO1xuXG4oZnVuY3Rpb24oKSB7XG5cInVzZSBzdHJpY3RcIjtcblxuYW5ndWxhclxuICAgIC5tb2R1bGUoJ2NvbXBvbmVudC1hY2Nlc3NvcicpXG4gICAgLmZhY3RvcnkoJ3BhZ2VIZWxwZXInLCBzZXJ2aWNlKTtcblxuZnVuY3Rpb24gc2VydmljZSgkY29tcGlsZSwgJHJvb3RTY29wZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVpbGRQYWdlOiBidWlsZFBhZ2UsXG4gICAgICAgIGdldEFjY2Vzc29yc0NsYXNzOiBnZXRBY2Nlc3NvcnNDbGFzc1xuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8qKlxuICAgICAgICAgICAgKiBVc2UgdGhpcyB0byBtYW51YWxseSBjcmVhdGUgZGlyZWN0aXZlcyBmb3IgdGVzdGluZy4gVGhpcyBvbmx5IGNyZWF0ZXMgdGhlIGRpcmVjdGl2ZS4gTWV0aG9kcyB0byBhY2Nlc3MgYW5kIG1hbmlwdWxhdGUgaXQgc2hvdWxkIGJlIGluIGFcbiAgICAgICAgICAgICogcGFnZSBhY2Nlc3NvciBvYmplY3QgY29ycmVzcG9uZGluZyB0byB0aGUgZGlyZWN0aXZlLiBcbiAgICAgICAgICAgICogXG4gICAgICAgICAgICAqIGNoZWNrIHpHcmlkLmRpcmVjdGl2ZS5zcGVjLmpzLCAgIGFuZCBpdHMgYWNjZXNzb3JzIHpHcmlkQWNjZXNzb3JzXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgb2Ygb3B0aW9ucyB1c2VkIHRvIGNvbmZpZ3VyZSBkaXJlY3RpdmUgY29uc3RydWN0aW9uOlxuICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICogICAgICAgIHtTdHJpbmd9IGh0bWwgKHJlcXVpcmVkKSBUaGUgSFRNTCB1c2VkIHRvIGNvbnN0cnVjdCB0aGUgZGlyZWN0aXZlLlxuICAgICAgICAgICAgKiAgICAgICAge09iamVjdH0gYWNjZXNzb3JzIGNsYXNzIHdoaWNoIHNob3VsZCBkZWZpbmUgYWxsIG1ldGhvZHMgdG8gYWNjZXNzIGh0bWwgZWxlbWVudHMgbWFkZSBhdmFpbGFibGUgYWZ0ZXIgY29tcGlsYXRpb24gb2YgdGhlIGNvZGVcbiAgICAgICAgICAgICogICAgICAgIHtPYmplY3R9IHNjb3BlIChvcHRpb25hbCkgVGhlIHNjb3BlIHRvIGNvbnN0cnVjdCB0aGUgZGlyZWN0aXZlIGVsZW1lbnQgd2l0aC4gVGhpcyBpcyBub3QgdGhlIGRpcmVjdGl2ZSBzY29wZS5cbiAgICAgICAgICAgICogICAgICAgIHtTdHJpbmd9IHZtIChvcHRpb25hbCkgdGhlIG5hbWUgb2YgdGhlIGNvbnRyb2xsZXIgaW4gdGhpcyBwYWdlLiBcbiAgICAgICAgICAgICogXG4gICAgICAgICAgICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNvbnN0cnVjdGVkIHBhZ2UuIEV4cG9zZXM6XG4gICAgICAgICAgICAqICAgICAgICAge09iamVjdH0gZWxlbWVudCA6IFRoZSBjb21waWxlZCBkaXJlY3RpdmUgZWxlbWVudC5cbiAgICAgICAgICAgICogICAgICAgICB7T2JqZWN0fSBzY29wZSA6IFRoZSBzY29wZSBvZiB0aGUgY29tcGlsZWQgZGlyZWN0aXZlLlxuICAgICAgICAgICAgKiAgICAgICAgIHttZXRob2RzfSBhbGwgYWNjZXNzb3JzIGFyZSBhY2Nlc3NpYmxlIGZyb20gdGhpcyBwYWdlIG9iamVjdCBkaXJlY3RseS5cbiAgICAgICAgICAgICogICAgICAgICBcbiAgICAgICAgICAgICovXG4gICAgZnVuY3Rpb24gYnVpbGRQYWdlKG9wdGlvbnMsIG5vRGlnZXN0KSB7XG4gICAgICAgIC8vIG9ubHkgY3JlYXRlIHRoZSB2bSBpZiBpdCBkb2VzIG5vdCBleGlzdFxuICAgICAgICBpZiAob3B0aW9ucy52bSAmJiAhb3B0aW9ucy5zY29wZVtvcHRpb25zLnZtXSkge1xuICAgICAgICAgICAgb3B0aW9ucy5zY29wZVtvcHRpb25zLnZtXSA9IHt9O1xuICAgICAgICB9XG5cblxuICAgICAgICB2YXIgZWxlbWVudCA9ICQoJzxkaXY+Jyk7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kKG9wdGlvbnMuaHRtbCk7XG5cbiAgICAgICAgJGNvbXBpbGUoZWxlbWVudCkob3B0aW9ucy5zY29wZSk7XG5cbiAgICAgICAgaWYgKCFub0RpZ2VzdCkge1xuICAgICAgICAgICAgb3B0aW9ucy5zY29wZS4kZGlnZXN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGFnZSA9IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgICAgICAgICRkaWdlc3Q6IGZ1bmN0aW9uIChkZWJ1Zykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuc2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgICAgICAgIGlmIChkZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICBwYWdlLnByaW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFAgQSBHIEUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkKCc8ZGl2PicpLmFwcGVuZChlbGVtZW50KS5jbG9uZSgpLmh0bWwoKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucy52bSkge1xuICAgICAgICAgICAgcGFnZVtvcHRpb25zLnZtXSA9IHBhZ2Uuc2NvcGVbb3B0aW9ucy52bV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXy5hc3NpZ24ocGFnZSwgbmV3IG9wdGlvbnMuYWNjZXNzb3JzKGVsZW1lbnQpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBnZXRBY2Nlc3NvcnNDbGFzcygpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIEFjY2Vzc29ycyhlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50QWNjZXNzb3I7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgYXBpID0ge1xuICAgICAgICAgICAgICAgIGZpbmQ6IGZpbmQsXG4gICAgICAgICAgICAgICAgZXhpc3RzOiBleGlzdHMsXG4gICAgICAgICAgICAgICAgY2xpY2s6IGNsaWNrLFxuICAgICAgICAgICAgICAgIGdldEh0bWw6IGdldEh0bWxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkID0gYWRkO1xuICAgICAgICAgICAgdGhpcy5leHRlbmQgPSBleHRlbmQ7XG4gICAgICAgICAgICB0aGlzLmRvID0gZG9GbjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLnNldFBhcmVudEFjY2Vzc29yID0gc2V0UGFyZW50QWNjZXNzb3I7XG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqIEBwYXJhbSBhcGlGdW5jdGlvbk5hbWUsIG9uZSBvZiB0aGUgYXBpIGZ1bmN0aW9uIChmaW5kLGV4aXN0cy4uLilcbiAgICAgICAgICAgICAqIEBwYXJhbSBsb2NhdG9yLCAganF1ZXJ5IHNlbGVjdG9yXG4gICAgICAgICAgICAgKiBAcGFyYW0gaW5jbHVkZUVsZW1lbnQsIGJ5IGRlZmF1bHQgb25seSBzZWFyY2ggYW1vbmcgdGhlIGRlc2NlbmRhbnRzLCBleGNsdWRpbmcgcGFyZW50LlxuICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgKiBAcmV0dXJucyBhIGZ1bmN0aW9uIHRvIHRoYXQgd291bGQgcnVuIHRoZSBzZWxlY3RlZCBhY3Rpb24gZnVuY3Rpb24gb24gaXRzIHF1ZXJ5IHNlbGVjdG9yIHdoZW4gY2FsbGVkO1xuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvRm4oYXBpRnVuY3Rpb25OYW1lLCBsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXBpW2FwaUZ1bmN0aW9uTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVzdCBmdW5jdGlvbiBbJyArIGFwaUZ1bmN0aW9uTmFtZSArICddIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcGlbYXBpRnVuY3Rpb25OYW1lXShsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGljayhsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHRoaXMuZmluZChsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NsaWNrYWJsZSBlbGVtZW50IFsnICsgbG9jYXRvciArICddIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBleGlzdHNGbihsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4aXN0cyhsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBleGlzdHMobG9jYXRvciwgaW5jbHVkZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFmaW5kKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KS5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEh0bWwobG9jYXRvciwgaW5jbHVkZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmluZChsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkuaHRtbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRBY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50QWNjZXNzb3IuZ2V0RWxlbWVudCgpLmZpbmQoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQYXJlbnRBY2Nlc3NvcihhY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgIHBhcmVudEFjY2Vzc29yID0gYWNjZXNzb3I7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGFkZChjaGlsZEVsZW1lbnRMb2NhdGlvbiwgQ2hpbGRFbGVtZW50QWNjZXNzb3JzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWNjID0gbmV3IENoaWxkRWxlbWVudEFjY2Vzc29yc0NsYXNzKGNoaWxkRWxlbWVudExvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBhY2Muc2V0UGFyZW50QWNjZXNzb3Ioc2VsZik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKEV4dGVuc2lvbkNsYXNzKSB7XG4gICAgICAgICAgICAgICAgXy5hc3NpZ24odGhpcywgbmV3IEV4dGVuc2lvbkNsYXNzKGdldEVsZW1lbnQoKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBmaW5kKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgbG9jYXRvciBpbiB0aGlzIHRoaXMgZWxlbWVudCBhbmQgYW1vbmcgZGVzY2VuZGFudHNcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudExvY2F0b3IgPSBnZXRFbGVtZW50KCkuYXR0cihcImNsYXNzXCIpLnNwbGl0KCcgJykuam9pbignLicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50TG9jYXRvciAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0b3IgPSAnLicgKyBwYXJlbnRMb2NhdG9yICsgbG9jYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RWxlbWVudCgpLnBhcmVudCgpLmZpbmQobG9jYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIGFtb25nIGRlc2NlbmRhbnRzIG9ubHlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldEVsZW1lbnQoKS5maW5kKGxvY2F0b3IpOztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59O1xufSgpKTtcblxuIiwiYW5ndWxhclxuICAgIC5tb2R1bGUoJ2NvbXBvbmVudC1hY2Nlc3NvcicsIFtdKTtcbiIsIlxuXG5hbmd1bGFyXG4gICAgLm1vZHVsZSgnY29tcG9uZW50LWFjY2Vzc29yJylcbiAgICAuZmFjdG9yeSgncGFnZUhlbHBlcicsIHNlcnZpY2UpO1xuXG5mdW5jdGlvbiBzZXJ2aWNlKCRjb21waWxlLCAkcm9vdFNjb3BlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBidWlsZFBhZ2U6IGJ1aWxkUGFnZSxcbiAgICAgICAgZ2V0QWNjZXNzb3JzQ2xhc3M6IGdldEFjY2Vzc29yc0NsYXNzXG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLyoqXG4gICAgICAgICAgICAqIFVzZSB0aGlzIHRvIG1hbnVhbGx5IGNyZWF0ZSBkaXJlY3RpdmVzIGZvciB0ZXN0aW5nLiBUaGlzIG9ubHkgY3JlYXRlcyB0aGUgZGlyZWN0aXZlLiBNZXRob2RzIHRvIGFjY2VzcyBhbmQgbWFuaXB1bGF0ZSBpdCBzaG91bGQgYmUgaW4gYVxuICAgICAgICAgICAgKiBwYWdlIGFjY2Vzc29yIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIHRoZSBkaXJlY3RpdmUuIFxuICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICogY2hlY2sgekdyaWQuZGlyZWN0aXZlLnNwZWMuanMsICAgYW5kIGl0cyBhY2Nlc3NvcnMgekdyaWRBY2Nlc3NvcnNcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNldCBvZiBvcHRpb25zIHVzZWQgdG8gY29uZmlndXJlIGRpcmVjdGl2ZSBjb25zdHJ1Y3Rpb246XG4gICAgICAgICAgICAqIFxuICAgICAgICAgICAgKiAgICAgICAge1N0cmluZ30gaHRtbCAocmVxdWlyZWQpIFRoZSBIVE1MIHVzZWQgdG8gY29uc3RydWN0IHRoZSBkaXJlY3RpdmUuXG4gICAgICAgICAgICAqICAgICAgICB7T2JqZWN0fSBhY2Nlc3NvcnMgY2xhc3Mgd2hpY2ggc2hvdWxkIGRlZmluZSBhbGwgbWV0aG9kcyB0byBhY2Nlc3MgaHRtbCBlbGVtZW50cyBtYWRlIGF2YWlsYWJsZSBhZnRlciBjb21waWxhdGlvbiBvZiB0aGUgY29kZVxuICAgICAgICAgICAgKiAgICAgICAge09iamVjdH0gc2NvcGUgKG9wdGlvbmFsKSBUaGUgc2NvcGUgdG8gY29uc3RydWN0IHRoZSBkaXJlY3RpdmUgZWxlbWVudCB3aXRoLiBUaGlzIGlzIG5vdCB0aGUgZGlyZWN0aXZlIHNjb3BlLlxuICAgICAgICAgICAgKiAgICAgICAge1N0cmluZ30gdm0gKG9wdGlvbmFsKSB0aGUgbmFtZSBvZiB0aGUgY29udHJvbGxlciBpbiB0aGlzIHBhZ2UuIFxuICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY29uc3RydWN0ZWQgcGFnZS4gRXhwb3NlczpcbiAgICAgICAgICAgICogICAgICAgICB7T2JqZWN0fSBlbGVtZW50IDogVGhlIGNvbXBpbGVkIGRpcmVjdGl2ZSBlbGVtZW50LlxuICAgICAgICAgICAgKiAgICAgICAgIHtPYmplY3R9IHNjb3BlIDogVGhlIHNjb3BlIG9mIHRoZSBjb21waWxlZCBkaXJlY3RpdmUuXG4gICAgICAgICAgICAqICAgICAgICAge21ldGhvZHN9IGFsbCBhY2Nlc3NvcnMgYXJlIGFjY2Vzc2libGUgZnJvbSB0aGlzIHBhZ2Ugb2JqZWN0IGRpcmVjdGx5LlxuICAgICAgICAgICAgKiAgICAgICAgIFxuICAgICAgICAgICAgKi9cbiAgICBmdW5jdGlvbiBidWlsZFBhZ2Uob3B0aW9ucywgbm9EaWdlc3QpIHtcbiAgICAgICAgLy8gb25seSBjcmVhdGUgdGhlIHZtIGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgIGlmIChvcHRpb25zLnZtICYmICFvcHRpb25zLnNjb3BlW29wdGlvbnMudm1dKSB7XG4gICAgICAgICAgICBvcHRpb25zLnNjb3BlW29wdGlvbnMudm1dID0ge307XG4gICAgICAgIH1cblxuXG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnPGRpdj4nKTtcbiAgICAgICAgZWxlbWVudC5hcHBlbmQob3B0aW9ucy5odG1sKTtcblxuICAgICAgICAkY29tcGlsZShlbGVtZW50KShvcHRpb25zLnNjb3BlKTtcblxuICAgICAgICBpZiAoIW5vRGlnZXN0KSB7XG4gICAgICAgICAgICBvcHRpb25zLnNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwYWdlID0ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlLFxuICAgICAgICAgICAgJGRpZ2VzdDogZnVuY3Rpb24gKGRlYnVnKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5zY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UucHJpbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUCBBIEcgRSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoJzxkaXY+JykuYXBwZW5kKGVsZW1lbnQpLmNsb25lKCkuaHRtbCgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLnZtKSB7XG4gICAgICAgICAgICBwYWdlW29wdGlvbnMudm1dID0gcGFnZS5zY29wZVtvcHRpb25zLnZtXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfLmFzc2lnbihwYWdlLCBuZXcgb3B0aW9ucy5hY2Nlc3NvcnMoZWxlbWVudCkpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIGdldEFjY2Vzc29yc0NsYXNzKCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gQWNjZXNzb3JzKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRBY2Nlc3NvcjtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBhcGkgPSB7XG4gICAgICAgICAgICAgICAgZmluZDogZmluZCxcbiAgICAgICAgICAgICAgICBleGlzdHM6IGV4aXN0cyxcbiAgICAgICAgICAgICAgICBjbGljazogY2xpY2ssXG4gICAgICAgICAgICAgICAgZ2V0SHRtbDogZ2V0SHRtbFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5hZGQgPSBhZGQ7XG4gICAgICAgICAgICB0aGlzLmV4dGVuZCA9IGV4dGVuZDtcbiAgICAgICAgICAgIHRoaXMuZG8gPSBkb0ZuO1xuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuc2V0UGFyZW50QWNjZXNzb3IgPSBzZXRQYXJlbnRBY2Nlc3NvcjtcblxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICogQHBhcmFtIGFwaUZ1bmN0aW9uTmFtZSwgb25lIG9mIHRoZSBhcGkgZnVuY3Rpb24gKGZpbmQsZXhpc3RzLi4uKVxuICAgICAgICAgICAgICogQHBhcmFtIGxvY2F0b3IsICBqcXVlcnkgc2VsZWN0b3JcbiAgICAgICAgICAgICAqIEBwYXJhbSBpbmNsdWRlRWxlbWVudCwgYnkgZGVmYXVsdCBvbmx5IHNlYXJjaCBhbW9uZyB0aGUgZGVzY2VuZGFudHMsIGV4Y2x1ZGluZyBwYXJlbnQuXG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqIEByZXR1cm5zIGEgZnVuY3Rpb24gdG8gdGhhdCB3b3VsZCBydW4gdGhlIHNlbGVjdGVkIGFjdGlvbiBmdW5jdGlvbiBvbiBpdHMgcXVlcnkgc2VsZWN0b3Igd2hlbiBjYWxsZWQ7XG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gZG9GbihhcGlGdW5jdGlvbk5hbWUsIGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcGlbYXBpRnVuY3Rpb25OYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXN0IGZ1bmN0aW9uIFsnICsgYXBpRnVuY3Rpb25OYW1lICsgJ10gZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFwaVthcGlGdW5jdGlvbk5hbWVdKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsaWNrKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gdGhpcy5maW5kKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2xpY2thYmxlIGVsZW1lbnQgWycgKyBsb2NhdG9yICsgJ10gbm90IGZvdW5kLicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV4aXN0c0ZuKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhpc3RzKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV4aXN0cyhsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIWZpbmQobG9jYXRvciwgaW5jbHVkZUVsZW1lbnQpLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SHRtbChsb2NhdG9yLCBpbmNsdWRlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaW5kKGxvY2F0b3IsIGluY2x1ZGVFbGVtZW50KS5odG1sKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEFjY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnRBY2Nlc3Nvci5nZXRFbGVtZW50KCkuZmluZChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBhcmVudEFjY2Vzc29yKGFjY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50QWNjZXNzb3IgPSBhY2Nlc3NvcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gYWRkKGNoaWxkRWxlbWVudExvY2F0aW9uLCBDaGlsZEVsZW1lbnRBY2Nlc3NvcnNDbGFzcykge1xuICAgICAgICAgICAgICAgIHZhciBhY2MgPSBuZXcgQ2hpbGRFbGVtZW50QWNjZXNzb3JzQ2xhc3MoY2hpbGRFbGVtZW50TG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIGFjYy5zZXRQYXJlbnRBY2Nlc3NvcihzZWxmKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBleHRlbmQoRXh0ZW5zaW9uQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBfLmFzc2lnbih0aGlzLCBuZXcgRXh0ZW5zaW9uQ2xhc3MoZ2V0RWxlbWVudCgpKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmQobG9jYXRvciwgaW5jbHVkZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBsb2NhdG9yIGluIHRoaXMgdGhpcyBlbGVtZW50IGFuZCBhbW9uZyBkZXNjZW5kYW50c1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50TG9jYXRvciA9IGdldEVsZW1lbnQoKS5hdHRyKFwiY2xhc3NcIikuc3BsaXQoJyAnKS5qb2luKCcuJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRMb2NhdG9yICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRvciA9ICcuJyArIHBhcmVudExvY2F0b3IgKyBsb2NhdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRFbGVtZW50KCkucGFyZW50KCkuZmluZChsb2NhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgYW1vbmcgZGVzY2VuZGFudHMgb25seVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RWxlbWVudCgpLmZpbmQobG9jYXRvcik7O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
