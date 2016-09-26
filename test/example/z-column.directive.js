// This component only works with the z-grid
angular
    .module('example')
    .directive('zColumn', zColumn);

function zColumn($timeout) {
    var directive = {
        link: link,
        restrict: 'E',
        template: '<div class="z-grid-column z-grid-content-column {{columnClass}}" ng-click="selectCell($event)"><div class="z-grid-cell {{cellClass}}"  ><ng-transclude></ng-transclude></div></div>',
        transclude: true,
        scope: true,
        //replace: true,
        require: '^zRow'
    };
    return directive;

    function link(scope, element, attrs, zRowCtrl, transclude) {
        var columnDef;
        scope.title = attrs.title;
        scope.orderBy = attrs.orderBy;
        scope.columnClass = attrs.columnClass;
        scope.cellClass = attrs.cellClass;
        scope.selectCell = selectCell;
        //  scope.disableRowSelection = attrs.disableRowSelection !== undefined;

        activate();
        //////////////////

        function activate() {
            columnDef = {
                title: scope.title,
                orderBy: scope.orderBy,
                columnClass: scope.columnClass
            };

            zRowCtrl.addColumn(columnDef, function (field, value) {
                // practical, we can now use the z-grid item name to find the object in the scope
                scope[field] = value;
            });

            // replace the transclude area with a clone of the transclude working on this specific scope
            transclude(scope, function (clone, scope) {
                element.find('ng-transclude').replaceWith(clone);
            });
        }

        function selectCell($event) {
            console.log("click cell")
            if (!zRowCtrl.isRowDisabled()) { //} && scope.disableRowSelection === false) {
                zRowCtrl.setSelectedCell(columnDef);
                if (!$event.originalEvent) {
                    $event.originalEvent = {};
                }
                $event.originalEvent.data = 'cellClick';

            }
        }

    }
}
