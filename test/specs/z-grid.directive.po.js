
angular
    .module('example')
    .factory('zGridAccessors', service);

function service(pageHelper) {
    // return the accessor class
    return function zGridAccessors(element) {
        // inherit all methods of the accessorsClass 
        pageHelper.getAccessorsClass().call(this, element);
        var self = this;

        this.getRows = this.do('find', '.z-grid-row.z-grid-content');
        this.getRowHeader = this.do('find', '.z-grid-row.z-grid-header');
        this.isHeaderVisible = this.do('exists', '.z-grid-row.z-grid-header');
        this.getHeaderCellById = getHeaderCellById;
        this.clickColumnHeader = clickColumnHeader;

        this.getSelectedRow = this.do('find', '.row-selected');
        this.getCellById = getCellById;
        this.getCellByIdFromRow = getCellByIdFromRow;
        this.clickCell = clickCell;
        this.clickRowAt = clickRowAt;
        this.isDisabled = this.do('exists', '.grid-disabled', true);


        ///////////////////////

        function getHeaderCellById(cellIndex, lastFinder) {
            lastFinder = lastFinder || '';
            return this.getRowHeader().find('.header-cell ' + lastFinder).eq(cellIndex);
        };

        function getCellById(rowIndex, cellIndex, lastFinder, fromRow) {
            lastFinder = lastFinder || '.ng-scope';
            fromRow = !_.isEmpty(fromRow) ? fromRow : self.getRows().eq(rowIndex);
            return fromRow.find('.z-grid-content-column .z-grid-cell ' + lastFinder).eq(cellIndex);
        };

        function getCellByIdFromRow(row, cellIndex) {
            return getCellById(-1, cellIndex, null, row);
        };


        function clickCell(rowIndex, columnIndex) {
            this.clickFn()
            getCellById(rowIndex, columnIndex).click();
        }

        function clickRowAt(rowIndex) {
            return this.getRows().eq(rowIndex).click();//find('.z-grid-content-column').first().click();
        };

        function clickColumnHeader(colIndex) {
            return this.getRowHeader().find('.header-cell').eq(colIndex).click();
        };
    };
}
