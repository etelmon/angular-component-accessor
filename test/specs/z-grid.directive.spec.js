describe('z-grid', function () {
    'use strict';
    var page,
        form,
        spec;

    beforeEach(module('example'));
    beforeEach(module('component-accessor'));

    beforeEach(inject(function ($compile, $rootScope, $q, pageHelper, zGridAccessors) {
        spec = {
            scope: $rootScope.$new(),// Don't directly update the $rootScope to reduce collisions
            pageHelper: pageHelper,
            zGridAccessors: zGridAccessors
        };
        setupData();
        setupSpies($q);
    }));


    function setupData() {

        spec.recordA = {
            id: '01',
            name: 'Test Qualification 1'
        };

        spec.recordB = {
            id: '02',
            name: 'Test Qualification 2'
        };

        spec.recordC = {
            id: '03',
            name: 'Test Qualification 3'
        };

        spec.rows = [
            spec.recordB,
            spec.recordA,
            spec.recordC
        ];

        spec.scope.vm = {
            onSelection: function () { },
            onEmpty: function () { }
        }
    };

    function setupSpies() {
        spyOn(spec.scope.vm, 'onSelection').and.callThrough();
        spyOn(spec.scope.vm, 'onEmpty').and.callThrough();
    };

    describe('empty data', function () {

        beforeEach(function () {
            initView1();
            page.scope.vm.rows = [];
            page.$digest();
        });

        it('should display one row', function () {
            expect(page.scope.vm.rows.length).toEqual(0);
            expect(page.grid.getRows().length).toEqual(1);
        });

        it('should display one row with @ empty columns', function () {
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual('');
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual('');
        });

        it('should display the row header', function () {
            expect(page.grid.getRowHeader().length).toEqual(1);
        });

        it('should display all header columns in order', function () {
            expect(page.grid.getHeaderCellById(0).html().trim()).toEqual('NameTitle');
            expect(page.grid.getHeaderCellById(1).html().trim()).toEqual('IdTitle');
        });

        xit('should call onEmpty when data is removed from list', function () {
            page.scope.vm.selectFirst = true; // this would never work when changed after compilation, there is no watcher...
            page.scope.vm.rows = spec.rows;
            page.$digest();
            expect(page.grid.getRows().length).toEqual(3);
            page.scope.vm.rows.splice(0, 1);
            page.$digest();
            expect(page.grid.getRows().length).toEqual(2);
            expect(spec.scope.vm.onEmpty).toHaveBeenCalled();

        });
    });

    it('should display all rows in natural order (no default index)', function () {
        initView2();
        page.scope.vm.rows = spec.rows;
        page.$digest();
        expect(page.scope.vm.rows.length).toEqual(spec.rows.length);
        expect(page.scope.vm.rows.length).toEqual(spec.rows.length);

        expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordB.id);
        expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordA.id);
        expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordC.id);
    });

    it('should display the row header', function () {
        initView2();
        expect(page.grid.isHeaderVisible()).toBe(true);
    });

    it('should remove the row header', function () {
        initView3();
        expect(page.grid.isHeaderVisible()).toBe(false);
    });


    describe('Ordered content', function () {

        beforeEach(function () {
            initView1();
            page.scope.vm.rows = spec.rows;
            page.$digest();
        });

        it('should display rows ordered with default-index', function () {
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordA.id);
            expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordB.name);
            expect(page.grid.getCellById(1, 1).html().trim()).toEqual(spec.recordB.id);
            expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(2, 1).html().trim()).toEqual(spec.recordC.id);
            //.hasClass(completeToFind)).toEqual(false);
            // expect(page.getCellById(index, 1).html().trim()).toEqual(survey.name + '');
        });

        it('should set the selected index to the default-index', function () {
            expect(page.scope.vm.orderBy).toEqual('name');
        });

        it('should re-ordered display on data modification', function () {
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordA.id);

            spec.recordC.name = 'AAAToTopOfLIst';
            page.$digest();

            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordC.id);

        });

        it('should NOT re-ordered display on data modification', function () {
            expect(page.scope.vm.orderBy).toEqual('name');
            page.scope.vm.disableSorting = true;
            spec.recordC.name = 'AAAToTopOfLIst';
            page.$digest();
            // This makes no sense....it just goes to natural order
            console.warn('disableSorting: Incorrect implementation');
            expect(page.scope.vm.orderBy).toEqual('');
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordB.id);

        });



        it('should display rows ordered with selected index', function () {
            page.scope.vm.orderBy = 'id';
            page.$digest();
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordA.id);
            expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordB.name);
            expect(page.grid.getCellById(1, 1).html().trim()).toEqual(spec.recordB.id);
            expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(2, 1).html().trim()).toEqual(spec.recordC.id);
        });

        it('should display rows ordered with selected index reversly', function () {
            page.scope.vm.orderBy = '-id';
            page.$digest();
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordC.id);
            expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordB.name);
            expect(page.grid.getCellById(1, 1).html().trim()).toEqual(spec.recordB.id);
            expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(2, 1).html().trim()).toEqual(spec.recordA.id);
        });

        it('should select a different index on clicking on a column header', function () {
            page.grid.clickColumnHeader(1);
            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordA.id);
            expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordB.name);
            expect(page.grid.getCellById(1, 1).html().trim()).toEqual(spec.recordB.id);
            expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(2, 1).html().trim()).toEqual(spec.recordC.id);
        });

        it('should select a reversed index on clicking twice on a column header', function () {
            page.grid.clickColumnHeader(1);
            page.grid.clickColumnHeader(1);

            expect(page.grid.getCellById(0, 0).html().trim()).toEqual(spec.recordC.name);
            expect(page.grid.getCellById(0, 1).html().trim()).toEqual(spec.recordC.id);
            expect(page.grid.getCellById(1, 0).html().trim()).toEqual(spec.recordB.name);
            expect(page.grid.getCellById(1, 1).html().trim()).toEqual(spec.recordB.id);
            expect(page.grid.getCellById(2, 0).html().trim()).toEqual(spec.recordA.name);
            expect(page.grid.getCellById(2, 1).html().trim()).toEqual(spec.recordA.id);
        });

        it('should call onSelection on row click (not column click) and pass no column', function () {
            page.grid.clickRowAt(1);
            expect(page.scope.vm.onSelection).toHaveBeenCalled();
            expect(page.scope.vm.onSelection.calls.argsFor(0)[0]).toBeUndefined();
        });


        xit('should call onSelection on cell click and pass current column', function () {
            page.grid.clickCell(1, 1);
            expect(page.scope.vm.onSelection).toHaveBeenCalled();
            expect(page.scope.vm.onSelection.calls.argsFor(0)[0].title).toEqual('IdTitle');
        });




    });
    describe('content', function () {

        beforeEach(function () {
            initView1();
            page.scope.vm.rows = spec.rows;
            page.$digest();
        });

        it('should display all rows', function () {
            expect(page.scope.vm.rows.length).toEqual(spec.rows.length);
            expect(page.scope.vm.rows.length).toEqual(spec.rows.length);
        });

        it('should display the row header', function () {
            expect(page.grid.getRowHeader().length).toEqual(1);
        });


        it('should display all header columns in order', function () {
            expect(page.grid.getHeaderCellById(0).html().trim()).toEqual('NameTitle');
            expect(page.grid.getHeaderCellById(1).html().trim()).toEqual('IdTitle');
        });

        it('should select the 1st row', function () {
            page.scope.vm.selectedRow = spec.recordB;
            page.$digest();
            expect(page.grid.getSelectedRow().html()).toContain(spec.recordB.name);
        });

        it('should set a different row when setting selected row', function () {
            var oldSelection = page.scope.vm.selectedRow;
            page.scope.vm.selectedRow = spec.recordA;
            page.$digest();
            expect(page.scope.vm.selectedRow).not.toBe(oldSelection);
            expect(page.grid.getSelectedRow().html()).toContain(spec.recordA.name);
        });

        it('should select clicked row', function () {
            var oldSelection = page.scope.vm.selectedRow;
            page.grid.clickRowAt(1);
            expect(page.grid.getSelectedRow().html()).toContain(spec.recordB.name);
            expect(page.scope.vm.selectedRow).not.toBe(oldSelection);
            expect(page.scope.vm.selectedRow).toBe(spec.recordB);
        });

        it('should set the row index when a row is clicked on', function () {
            page.grid.clickRowAt(0);
            expect(page.scope.vm.rowIndex).toBe(0);
            page.grid.clickRowAt(1);
            expect(page.scope.vm.rowIndex).toBe(1);
        });

        xit('should set the row index when setting selected row', function () {
            page.scope.vm.selectedRow = spec.recordA;
            page.$digest();
            // not implemented properly
            expect(page.scope.vm.rowIndex).toBe(1);
        });


        it('should call onSelection on row click and pass current selection', function () {
            // page.scope.vm.selectedRow = spec.recordB;
            // page.$digest();
            page.grid.clickRowAt(1);
            expect(page.scope.vm.onSelection).toHaveBeenCalled();
            expect(page.scope.vm.onSelection.calls.argsFor(0)[1].id).toEqual(page.scope.vm.selectedRow.id);
        });


        xit('should call onSelection on row selection and pass current selection', function () {
            page.scope.vm.selectedRow = spec.recordB;
            page.$digest();
            expect(page.scope.vm.onSelection).toHaveBeenCalled();
            expect(page.scope.vm.onSelection.calls.argsFor(0)[1].id).toEqual(page.scope.vm.selectedRow.id);
        });

        it('should be set to disabled', function () {
            page.scope.vm.disableGrid = true;
            page.$digest();
            expect(page.grid.isDisabled()).toBe(true);
        });

        it('should not be able to click when disabled', function () {
            page.scope.vm.disableGrid = true;
            page.$digest();
            var oldSelection = page.scope.vm.selectedRow;
            page.grid.clickRowAt(1);
            expect(page.scope.vm.selectedRow).toBe(oldSelection);
        });

    });


    function PageAccessor(element) {
        spec.pageHelper.getAccessorsClass().call(this, element);
        // pageHelper.extend(this, zGridAccessors);
        this.grid = this.add('.z-grid', spec.zGridAccessors);
    }

    function initView1() {
        page = spec.pageHelper.buildPage({
            scope: spec.scope,
            vm: 'vm',
            accessors: PageAccessor,
            html: [
                '<z-grid',
                '   items="vm.rows"',
                '   item="row"',
                '   default-index="name"',
                '   order-by="vm.orderBy"',
                '   selected-item="vm.selectedRow"',
                '   disable-sorting="vm.disableSorting"',
                '   disable-grid="vm.disableGrid"',
                '   row-index="vm.rowIndex"',
                '   on-selection="vm.onSelection(column, row)"',
                '   on-empty="vm.onEmpty()"',
                '   select-first="vm.selectFirst">',
                '>',
                '     <z-column title="NameTitle" column-class="name-column" order-by="name">',
                '       {{row.name}}',
                '     </z-column>',
                '     <z-column title="IdTitle" column-class="" order-by="id">',
                '       {{row.id}}',
                '     </z-column>',
                '</z-grid>'
            ].join('')
        });
              
        return page;
    };


    function initView2() {
        page = spec.pageHelper.buildPage({
            scope: spec.scope,
            vm: 'vm',
            accessors: PageAccessor,
            html: [
                '<z-grid',
                '   items="vm.rows"',
                '   item="row"',
                '>',
                '     <z-column title="IdTitle" column-class="" order-by="id">',
                '       {{row.id}}',
                '     </z-column>',
                '</z-grid>'

            ].join('')
        });
        return page;
    };

    function initView3() {
        page = spec.pageHelper.buildPage({
            scope: spec.scope,
            vm: 'vm',
            accessors: PageAccessor,
            html: [
                '<z-grid',
                '   items="vm.rows"',
                '   item="row"',
                '    hide-header="true"',
                '>',
                '     <z-column title="IdTitle" column-class="" order-by="id">',
                '       {{row.id}}',
                '     </z-column>',
                '</z-grid>'

            ].join('')
        });
        return page;
    };

});
