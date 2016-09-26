describe('z-grid', function () {
    'use strict';
    var page,
        form,
        spec;

    beforeEach(module('component-accessor'));

    beforeEach(inject(function ($compile, $rootScope, $q, pageHelper) {
        spec = {
            scope: $rootScope.$new(),// Don't directly update the $rootScope to reduce collisions
            pageHelper: pageHelper
        };
        setupData();
        setupSpies($q);
    }));


    function setupData() {

    };

    function setupSpies() {
    };

    describe('content', function () {

        beforeEach(function () {
            initView();
        });

        it('should locate title in area1', function () {
            expect(page.area1.getTitle()).toEqual('Hello');
        });
        it('should locate title in area2', function () {
            expect(page.area2.getTitle()).toEqual('Bonjour');
        });
        it('should locate text in area1', function () {
            expect(page.area1.subTitle.getText()).toEqual('You');
        });

        it('should locate text in area2', function () {
            expect(page.area2.subTitle.getText()).toEqual('Toi');
        });

        it('should NOT locate title in area3 in existing parent element', function () {
            expect(page.area3.getTitle()).toBeUndefined();
        });

        it('should locate title after parent element was created', function () {
            expect(page.area3.getTitle()).toBeUndefined();
            page.element.append(
                ['<div class="area3">',
                    '   <h1>Como Esta</h1>',
                    '    <h2>',
                    '   <span class="test">Usted</span>',
                    '    </h2>',
                    '</div>'
                ].join('')
            );

            expect(page.area3.getTitle()).toEqual('Como Esta');
        });

    });


    function PanelAccessor(element) {
        spec.pageHelper.getAccessorsClass().call(this, element);
        this.subTitle = this.add('h2', TextAccessor);
        this.getTitle = this.do('getHtml', 'h1');

    }


    function TextAccessor(element) {
        spec.pageHelper.getAccessorsClass().call(this, element);
        this.getText = this.do('getHtml', 'span');
    }

    function PageAccessor(element) {
        spec.pageHelper.getAccessorsClass().call(this, element);
        this.area1 = this.add('.area1', PanelAccessor);
        this.area2 = this.add('.area2', PanelAccessor);
        this.area3 = this.add('.area3', PanelAccessor);
    }

    function initView() {
        page = spec.pageHelper.buildPage({
            scope: spec.scope,
            vm: 'vm',
            accessors: PageAccessor,
            html: [
                '<div class="area1">',
                '   <h1 class="hh">Hello</h1>',
                '    <h2>',
                '   <span class="test">You</span>',
                '    <h2>',
                '</div>',
                '<div class="area2">',
                '   <h1>Bonjour</h1>',
                '    <h2>',
                '   <span class="test">Toi</span>',
                '    </h2>',
                '</div>'
            ].join('')
        });

        return page;
    };



});
