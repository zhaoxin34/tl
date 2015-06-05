'use strict';
// $(document).ready(function() {
//     // var h = Snap('#history');
//     // var circle = h.circle(100, 100, 50);
//     // circle.attr({
//     //     fill: '#f00'
//     // });
//     // begin


//     var panel = {};
//     panel.init = function(_config) {

//     };
// });
//

(function($) {
    /**
     * create hispanle
     * @param {[type]} config [description]
     */
    function HisPanel(config) {
        var obj = this;
        var conf = {
            id: '#history',
            cellWidth: 30,
            cellHeight: 30
        };

        $.extend(conf, config);
        var snap = new Snap('#history');
        // var circle = snap.circle(100, 150, 50);
        // circle.attr({
        //     fill: '#ff0'
        // });
        var container = this.container = $(conf.id);
        this.width = container.innerWidth();
        this.height = container.innerHeight();
        this.cellCountX = this.width / conf.cellWidth;
        this.cellCountY = this.height / conf.cellHeight;
        this.cells = [];
        this._createCellObjs = function() {
            obj.cells = [];
            for (var i=0; i<obj.cellCountX; i++) {
                var cellsY = [];
                for (var j=0; j<obj.cellCountY; j++) {
                    cellsY.push(new HisCell(i * conf.cellWidth, j* conf.cellHeight, i, j,
                        conf.cellWidth, conf.cellHeight, snap));
                }
                obj.cells.push(cellsY);
            }
        };
        this._init = function() {
            this._createCellObjs();
        };

        this.getCell = function(x, y) {
            return this.cells[x][y];
        };

        // call init
        this._init();

        this.getCell(0, 3)
        .fillText({content:'test', align:'middle', vAlign:'center'})
        .drawBorder( {
            roundRadius: 2,
            'fill-opacity': 0,
            stroke: '#0f0',
            strokeWidht: 2
        });

        this.getCell(2, 3)
        .fillText({content:'testsdfsdf', align:'left', vAlign:'bottom'})
        .drawBorder( {
            'fill-opacity': 0,
            stroke: '#0ff',
            strokeWidht: 1
        });
    }

    function HisCell(x, y, xs, ys, width, height, snap) {
        var obj = this;
        this.x = x;
        this.y = y;
        this.xs = xs;
        this.ys = ys;
        this.width = width;
        this.height = height;
        this.snap = snap;
        this.elements = [];
        this.members = [];

        /**
         * fill text with attr
         * add members
         * @param  {object} attr like {content:'a content', align:'left|middle|right', vAlign:'top|bottom|center'}
         * @return {void}
         */
        this.fillText = function(attr) {
            var text = this._fillText(attr);
            obj.members.push({func:this._fillText, attr:attr, ele: text});
            return obj;
        };

        /**
         * fill text with attr
         * add elements
         * @param  {object} attr like {content:'a content', align:'left|middle|right', vAlign:'top|bottom|center'}
         * @return {element} the text element
         */
        this._fillText = function(attr) {
            var fontHeight = 6;
            var tx = obj.x + obj.width / 2;
            var ty = obj.y + obj.height/ 2 + fontHeight;
            if (attr.align === 'middle') {
                attr['text-anchor'] = 'middle';
            } else if (attr.align === 'right') {
                tx = obj.x + obj.width;
                attr['text-anchor'] = 'end';
            } else {
                tx = obj.x;
                attr['text-anchor'] = 'start';
            }
            if (attr.vAlign === 'bottom') {
                ty = obj.y + obj.height;
            } else if (attr.vAlign === 'top') {
                ty = obj.y + fontHeight;
            }

            var text = snap.text(tx, ty, attr.content);
            attr = $.extend({}, attr);
            delete attr.content;
            text.attr(attr);
            obj.elements.push(text);
            return text;
        };

        /**
         * get center point
         * @return {object} {x: number(x), y: number{y}}
         */
        this.getCenter = function() {
            return {x: this.x + this.width / 2, y: this.y + this.height / 2};
        };

        /**
         * draw a border on rect
         * add members
         * @param  {object} attr {roundRadius: number(round radius), ...other attrs}
         * @return {void}
         */
        this.drawBorder = function(attr) {
            var border = this._drawBorder(attr);
            obj.members.push({func:this._drawBorder, attr:attr, ele: border});
            return obj;
        };

        /**
         * draw a border on rect
         * add elements
         * @param  {object} attr {roundRadius: number(round radius), ...other attrs}
         * @return {void} the rect element
         */
        this._drawBorder = function(attr) {
            attr = $.extend({}, attr);
            var rect = snap.rect(this.x, this.y, this.width, this.height, attr.roundRadius ? attr.roundRadius:0);
            delete attr.roundRadius;
            rect.attr(attr);
            this.border = rect;
            obj.elements.push(rect);
            return rect;
        };

        console.log('cell x', x);
        console.log('cell y', y);
        console.log('cell xs', xs);
        console.log('cell xy', ys);
        console.log('cell width', width);
        console.log('cell height', height);
    }

    $(document).ready(function () {
        var his = new HisPanel();
        console.log('width=', his.width);
        console.log('height=', his.height);
        console.log('cellCountX=', his.cellCountX);
        console.log('cellCountY=', his.cellCountY);
        console.log('cells=', his.cells);
    });
})(jQuery);
