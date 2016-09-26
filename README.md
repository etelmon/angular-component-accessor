### Scope

This angular module provides helpers to build a page object to help test your directive.

Page object regroups the accessors required to access web element of your directive.

Each time an accessor is used, it will locate the element to make sure your accessing the current dom element.

The additional benefit of this solution is providing accessor reusability.
When testing a page that is composed a multiple components, you can re-use accessors you have already defined for the test of those specific components.



#road map
- remove 'this' when defining the page accessors.
- logging strategy to help debugging.
