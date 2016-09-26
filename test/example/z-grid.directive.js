angular
    .module('example')
    .directive('zGrid', zGrid);

function zGrid() {
    var directive = {
        restrict: 'E',
        transclude: true,
        scope: {
            items: '=?',
            itemName: '@item',
            trackBy: '@',// The property in the grid to track a column by. These must all be unique fields. Defaults to 'id'.
            defaultIndex: '@',
            orderBy: '=?',// current index (column name), add minus to the value to get reversed order 
            selectedItem: '=?', // will contain the item currently selected. You can also force selection of a row/item (will use the trackBy field name or id of the object to locate.)
            rowIndex: '=?',// The currently selected row index. This is set before the current item is set.
            hideHeader: '@',
            disableGrid: '=?',
            disableSorting: '=?',// When true the sorting is fixed no matter what the user does.
            onSelection: '&?', // when the user selects a row (and a cell), this function will be called. the function must have a param with the name provided in item.   ex: <z-grid items="people" item="person" on-selection="showDetails(column,person)">
            onEmpty: '&?',
            selectFirst: '=?' // boolean, if need to select first after deleting
        },
        controller: controller,
        controllerAs: 'zGridVm',
        bindToController: true,
      //  template:'<div></div>'
        template:
        '<div class=\'z-grid\' ng-class="{\'grid-disabled\': zGridVm.disableGrid}"> \
    <div ng-if="::!zGridVm.hideHeader" class="z-grid-row z-grid-header"> \
        <div class="z-grid-column header-column margin-area"> \
        </div> \
        <div class="z-grid-column header-column {{column.columnClass}}" ng-class="zGridVm.isOrderBy(column)?\'order-by-selected\':\'\'" \
            ng-repeat="column in zGridVm.columns" ng-click="zGridVm.toggleOrderBy(column)"> \
            <div class="header-cell"> \
            {{::column.title}}</div> \
        </div>\
        <div class="z-grid-column header-column margin-area">\
        </div>\
    </div>\
    <div ng-if="!zGridVm.items || zGridVm.items.length==0" z-row row-index="{{$index}}" class="z-grid-row z-grid-content" style=\'display:none\'> \
        <div class="z-grid-column  margin-area"> \
        </div> \
        <ng-transclude></ng-transclude> \
        <div class="z-grid-column  margin-area"> \
        </div> \
    </div> \
    <div ng-if="zGridVm.items.length>0" z-row row-index="{{$index}}" class="z-grid-row z-grid-content" ng-class="zGridVm.isRowSelected(item)?\'row-selected\':\'\'" ng-click="zGridVm.clickRow($event,item,$index)" \
        ng-repeat="item in zGridVm.items | orderBy:zGridVm.orderBy track by item[zGridVm.trackBy]"> \
        <div class="z-grid-column  margin-area"> \
        </div> \
        <ng-transclude></ng-transclude> \
        <div class="z-grid-column  margin-area"> \
        </div> \
    </div> \
    <div ng-if="zGridVm.disableGrid" class="grid-overlay"></div> \
</div>'
    };
    return directive;

    //////////////
    function controller($scope, $attrs, $filter) {
        var getIdentity,
            columnMap = {};
        var vm = this;

        // use by z-row to register to the grid
        this.addColumn = addColumn;
        this.getItemName = getItemName;
        this.updateSelectedItem = updateSelectedItem;
        this.isGridDisabled = isGridDisabled;

        // vm api
        vm.toggleOrderBy = toggleOrderBy;
        vm.isRowSelected = isRowSelected;
        vm.isOrderBy = isOrderBy;
        vm.trackBy = !vm.trackBy ? 'id' : vm.trackBy;
        vm.setSelectedCell = setSelectedCell;
        vm.columns = [];
        vm.clickRow = clickRow;

        activate();

        ////////////////////////////////////
        function activate() {
            if (angular.isUndefined($attrs.item) || angular.isUndefined($attrs.items)) {
                throw (new Error('the z-grid requires both items and item attributes.'));
            }
            if ($attrs.selectedItem && $attrs.selectedItem.indexOf('.') === -1) {
                throw (new Error('the selectedItem attribute of z-grid requires to use the dot rule within its object name.'));
            }
            if ($attrs.selectedItem) {
                $scope.$parent.$watch($attrs.selectedItem, function (newObj, oldObj) {
                    if (newObj && newObj != oldObj) {
                        selectItem(newObj);
                    }
                });

                if (vm.selectFirst && vm.selectFirst === true) {

                    $scope.$parent.$watch($attrs.items, function (newObj, oldObj) {
                        if (newObj) {
                            var oldObjLength = oldObj.length;
                            var newObjLength = newObj.length;
                            /* eslint-disable no-eval */
                            var selectedItem = eval('$scope.$parent.' + $attrs.selectedItem);
                            /* eslint-disable no-eval */
                            // careful, the following won't work, there is a dot in selectedItem value;
                            // $scope.$parent[$attrs.selectedItem] = obj;
                            if (selectedItem) {
                                if (newObj.length) {
                                    var found = findItem(selectedItem.id);
                                    if (newObjLength < oldObjLength && !found) {
                                        var firstObj = vm.orderBy !== "" ? $filter("orderBy")(newObj, vm.orderBy)[0] : newObj[0];
                                        selectItem(firstObj);
                                    }
                                } else {
                                    vm.selectedItem = null;

                                    if (vm.onEmpty) {
                                        vm.onEmpty();
                                    }
                                }
                            }
                        }
                    }, true);
                }
            }

            // default index is used if no order is provided.
            if (vm.defaultIndex && !vm.orderBy) {
                vm.orderBy = vm.defaultIndex;
            }

            if ($attrs.trackBy) {
                getIdentity = function (obj) {
                    return obj[$attrs.trackBy];
                };
            } else {
                getIdentity = function (obj) {
                    return obj.id;
                };
                vm.trackBy = 'id'
            }

            $scope.$watch(function () {
                return vm.disableSorting;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue && newValue === true) {
                    // TODO: forcing the natural order might not be the best way to disable sorting..
                    vm.orderBy = '';
                }
            });
        }

        function updateSelectedItem(obj) {
            if ($attrs.selectedItem && isRowSelected(obj)) {
                // TODO eval should not be necessary. Lodash may have a path setter like _.get deos for retrievals
                /* eslint-disable no-eval */
                eval('$scope.$parent.' + $attrs.selectedItem + '=obj');
                /* eslint-enable no-eval */
                // careful, the following won't work, there is a dot in selectedItem value;
                // $scope.$parent[$attrs.selectedItem] = obj;               
            }
        }

        function setSelectedCell(item, column, rowIndex) {
            if (isGridDisabled() !== true) {
                vm.rowIndex = rowIndex;

                //          if (!isSelected(item)) {
                vm.selectedItem = item;
                if (vm.onSelection) {
                    var params = {};
                    params[getItemName()] = item;
                    if (column) {
                        var n = vm.columns.indexOf(column);
                        params.column = {
                            number: n == -1 ? null : n,
                            title: column.title
                        };
                    }
                    updateSelectedItem(item);
                    vm.onSelection(params);
                }
                //        }
            }
        }

        function isRowSelected(item) {
            if (item && getIdentity(item) !== null) {
                return vm.selectedItem && getIdentity(vm.selectedItem) === getIdentity(item);
            }
            return vm.selectedItem === item;
        }

        function addColumn(column, item) {
            if (!columnMap[column.title]) {
                columnMap[column.title] = column;
                vm.columns.push(column);
                // quick hack to select the first item in current order... need more testing.
                if ((!vm.selectedItem || !getIdentity(vm.selectedItem)) && item) {
                    setSelectedCell(item, column);
                }
            }

        }

        function toggleOrderBy(column) {
            if (!isGridDisabled() && vm.disableSorting !== true) {
                // if (column.orderBy && vm.orderBy !== column.orderBy) {
                //     vm.orderBy = column.orderBy;
                // }
                if (column.orderBy) {
                    if (vm.orderBy === column.orderBy) {
                        vm.orderBy = '-' + column.orderBy
                    } else {
                        vm.orderBy = column.orderBy;
                    }
                }
            }
        }

        function isOrderBy(column) {
            // Also, if there is no content, the sort column is not selected.
            return vm.orderBy && (vm.orderBy === column.orderBy || vm.orderBy === '-' + column.orderBy) && vm.items && vm.items.length > 0
        }

        function getItemName() {
            return vm.itemName;
        }

        function isGridDisabled() {
            return vm.disableGrid === true;
        }

        /** if we do not select the proper instance, the modification to obj will not be visible in the grid */
        function selectItem(item) {
            var found = findItem(getIdentity(item));
            if (found && found != item) {
                vm.selectedItem = found;
                // console.log('found');
            } else {
                vm.selectedItem = item;
            }
        }

        function findItem(identity) {
            var found;
            for (var n = 0; n < vm.items.length; n++) {
                if (getIdentity(vm.items[n]) == identity) {
                    found = vm.items[n];
                    break;
                }
            }
            return found;
        }

        function clickRow($event, item, rowIndex) {
            if (!isGridDisabled() && (!$event.originalEvent || $event.originalEvent.data !== 'cellClick')) {
                setSelectedCell(item, null, rowIndex);
            }
        }
    }
}

// This component only works with the z-grid
angular
    .module('example')
    .directive('zRow', zRow);

function zRow($timeout) {
    var directive = {
        link: link,
        restrict: 'A',
        require: '^zGrid',
        controller: function ($scope) {
            $scope.columns = [];
            this.setSelectedCell = setSelectedCell;
            this.isRowDisabled = isRowDisabled;
            this.addColumn = addColumn;

            //////////////////

            function setSelectedCell(columnDef) {
                $scope.zGridCtrl.setSelectedCell($scope.item, columnDef, $scope.rowIndex);
            }

            function addColumn(columnDef, setItemReference) {
                $scope.columns.push({ def: columnDef, setItemReference: setItemReference });
            };

            function isRowDisabled() {
                return $scope.zGridCtrl.isGridDisabled();
            }
        }
    };
    return directive;

    function link(scope, element, attrs, zGridCtrl) {
        scope.rowIndex = Number(attrs.rowIndex);
        scope.zGridCtrl = zGridCtrl;

        // register column associated to this row
        scope.columns.forEach(function (column) {
            zGridCtrl.addColumn(column.def, scope.item);
            column.setItemReference(zGridCtrl.getItemName(), scope.item);
        });
        zGridCtrl.updateSelectedItem(scope.item);

        // this makes sure that the scope of the column component has access to the object set in zgrid item name.  
        scope.$watch('item', function (newValue, oldValue) {
            if (!oldValue || newValue != oldValue) {
                scope.columns.forEach(function (column) {
                    column.setItemReference(zGridCtrl.getItemName(), scope.item);
                });
                zGridCtrl.updateSelectedItem(scope.item);
            }
        });

    }
}
