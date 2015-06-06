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
            cellWidth: 60,
            infoCellHeight: 60,
            tlCellHeight: 30,
            // span count per tl cell
            tlSpanCount:5,
            tlSpanLineStrokeWidth:2,
            tlSpanLineStrokeColor: '#999',
            tlSpanVLineLength: 5,
            tlSpanVLineStrokeWidth: 1,
            tlSpanVLineStrokeColor: '#666',
            tlSpanTextAttr: {
                'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                'font-size'  : 11,
                // stroke     : '#00ff00',
                fill       : '#999'
            },
            tlTextSpan:2,
            startDateTime: {
                year: 2015,
                month: 1,
                date: 1
            },
            endDateTime: {
                year: 2015,
                month: 12,
                date: 1
            },
            scale: 0
        };

        $.extend(true, conf, config);
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
        this.infoCells = [];
        this.tlCells = [];
        this.toolTip = new ToolTip(snap);
        this.toolTip.setTitle('this is title');
        this.toolTip.setContent(['content1', 'content2']);
        this.toolTip.show(true);
        this.toolTip.moveTo(300,200);
        this.toolTip.setContent(['content11', 'content2334', 'content3434']);
        this.toolTip.moveTo(400,300);

        this._createCellObjs = function() {
            obj.width = container.innerWidth();
            obj.height = container.innerHeight();
            obj.cellCountX = obj.width / conf.cellWidth;
            obj.cellCountY = Math.floor((obj.height - conf.tlCellHeight)/ conf.infoCellHeight);
            obj.infoCells = [];
            obj.tlCells = [];
            for (var i=0; i<obj.cellCountX; i++) {
                var cellsY = [];
                for (var j=0; j<obj.cellCountY; j++) {
                    cellsY.push(new HisCell(i * conf.cellWidth, j* conf.infoCellHeight,
                        conf.cellWidth, conf.infoCellHeight, snap));
                }
                obj.infoCells.push(cellsY);
            }
            for (i=0; i<obj.cellCountX; i++) {
                obj.tlCells.push(new HisCell(i * conf.cellWidth, obj.cellCountY * conf.infoCellHeight, conf.cellWidth,
                    conf.tlCellHeight, snap));
            }
        };

        /**
         * destroy the cells
         * @return {void}
         */
        this.destroy = function() {
            for (var i=0; i<obj.infoCells.length; i++) {
                for (var j=0; j<obj.infoCells[i].length; j++) {
                    var cell = obj.infoCells[i][j];
                    cell.destroy();
                }
            }
            obj.infoCells = [];
            for (i=0; i<obj.cellCountX; i++) {
                obj.tlCells[i].destroy();
            }
            obj.tlCells = [];
        };

        /**
         * draw the panel, must after _init
         * @return {[type]} [description]
         */
        this._draw = function() {
            this.getInfoCell(0, 3)
            .fillText({content:'test', align:'middle', vAlign:'center'})
            .drawBorder( {
                roundRadius: 2,
                'fill-opacity': 0,
                stroke: '#0f0',
                strokeWidht: 2
            });
            this.drawTimeLine();
        };
        /**
         * redraw the panel
         * @return {void}
         */
        this.redraw = function() {
            this.destroy();
            this._createCellObjs();
            this._draw();
        };

        /**
         * only execute once
         * @return {void}
         */
        this._init = function() {
            this._createCellObjs();
        };

        this.getInfoCell = function(x, y) {
            return obj.infoCells[x][y];
        };

        this.getTlCell = function(x) {
            return this.tlCells[x];
        };

        /**
         * get cell count
         * @return {object} {xCount:number(x), yCount:number(y)}
         */
        this.getInfoCellCount = function() {
            var cellCount = {xCount: 0, yCount: 0};
            if (obj.cells !== undefined && obj.cells.length > 0 && obj.cells[0].length > 0) {
                cellCount.xCount = obj.cells.length;
                cellCount.yCount = obj.cells[0].length;
            }
            return cellCount;
        };

        /**
         * 画时间线
         * @param  {object} startDateTime {year:number, month:number, day:number, hour:number, min:number, second:number}
         * @param  {object} endDateTime   {year:number, month:number, day:number, hour:number, min:number, second:number}
         * @todo not need implements now
         * @param  {number} scale         must be integer, if > 0, year = year * 10^scale if < 0 second = second / 10 ^(-scale)
         */
        this.drawTimeLine = function() {
            for (var i = 0; i < obj.tlCells.length; i++) {
                var cell = obj.tlCells[i];
                // cell.drawBorder( {
                //     roundRadius: 2,
                //     'fill-opacity': 0,
                //     stroke: '#0f0',
                //     strokeWidht: 2
                // });
                // 画横线
                cell.drawLine({x1:0, y1:0, x2:1, y2:0, stroke:conf.tlSpanLineStrokeColor, 'stroke-width': conf.tlSpanLineStrokeWidth} );
                var tlSpanX = conf.cellWidth / conf.tlSpanCount;
                var tlSpanHeightScale = conf.tlSpanVLineLength / conf.tlCellHeight;
                // 画刻度
                for (var j=0; j<conf.tlSpanCount; j++) {
                    var y2 = j === 0 && i % conf.tlTextSpan === 0 ? tlSpanHeightScale * 2 : tlSpanHeightScale;
                    cell.drawLine({x1:tlSpanX * j, y1:0, x2: j/conf.tlSpanCount, y2:y2,
                        stroke:conf.tlSpanVLineStrokeColor, 'strokeWidht': conf.tlSpanVLineStrokeWidth});
                }
            }
            obj._drawTimeLineText();
        };

        this._drawTimeLineText = function() {
            var startDateTime = $.extend({year:0, month:0, day:0, hour:0, min:0, second:0}, conf.startDateTime);
            var endDateTime = $.extend({year:0, month:0, day:0, hour:0, min:0, second:0}, conf.endDateTime);
            var scale = conf.scale;
            var oneSpanTime = 1;

            if (scale === undefined || scale === 0) {
                var d1 = new Date(startDateTime.year, startDateTime.month - 1, startDateTime.date,
                    startDateTime.hour, startDateTime.min, startDateTime.second);
                var d2 = new Date(endDateTime.year, endDateTime.month - 1, endDateTime.date,
                    endDateTime.hour, endDateTime.min, endDateTime.second);
                oneSpanTime = (d2.getTime() - d1.getTime()) / obj.tlCells.length;
                if (isNaN(oneSpanTime) || oneSpanTime < 0) {
                    console.log('warning', 'oneSpanTime', oneSpanTime, 'd1', d1, 'd2', d2);
                    return;
                }
                console.log(oneSpanTime);
                for (var i = 0; i < obj.tlCells.length; i++) {
                    var cell = obj.tlCells[i];
                    // 画文字
                    if (scale === undefined || scale === 0) {
                        if ( i % conf.tlTextSpan === 0) {
                            var date = new Date(d1.getTime() + i * oneSpanTime);
                            console.log(date);
                            var content = date.toFormat('YYYY-MM-DD');
                            var spanTextAttr = $.extend({}, conf.tlSpanTextAttr);
                            spanTextAttr = $.extend(spanTextAttr, {content: content, align:'left', vAlign:'bottom'});
                            cell.fillText(spanTextAttr);
                        }
                    }
                }
            }


        };
        // call init
        this._init();
        this._draw();
    }

    /**
     * History cell Class
     * @param {number} x      x
     * @param {number} y      y
     * @param {number} width  width
     * @param {number} height
     * @param {snap} snap
     */
    function HisCell(x, y, width, height, snap) {
        var obj = this;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.snap = snap;
        // all member like this {attr: creatAttr, ele: the element}
        this.textMembers = [];
        this.lineMembers = [];
        this.borderMembers = [];

        this.destroy = function() {
            obj._removeMembers(this.textMembers);
            obj.textMembers = [];
            obj._removeMembers(this.lineMembers);
            obj.lineMembers = [];
            obj._removeMembers(this.borderMembers);
            obj.borderMembers = [];
        };

        this._removeMembers = function(members) {
            if (!members){
                return;
            }
            for (var i=0; i<members.length; i++) {
                members[i].ele.remove();
            }
        };

        /**
         * fill text with attr,
         * @param  {object} attr like {content:'a content', align:'left|middle|right', vAlign:'top|bottom|center'}
         * @return {void}
         */
        this.fillText = function(attr) {
            var text = this._fillText(attr);
            obj.textMembers.push({attr:attr, ele: text});
            return obj;
        };

        /**
         * fill text with attr
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
         * @param  {object} attr {roundRadius: number(round radius), ...other attrs}
         * @return {void}
         */
        this.drawBorder = function(attr) {
            var border = this._drawBorder(attr);
            obj.borderMembers.push({attr:attr, ele: border});
            return obj;
        };

        /**
         * draw a border on rect
         * @param  {object} attr {roundRadius: number(round radius), ...other attrs}
         * @return {void} the rect element
         */
        this._drawBorder = function(attr) {
            attr = $.extend({}, attr);
            var rect = snap.rect(this.x, this.y, this.width, this.height, attr.roundRadius ? attr.roundRadius:0);
            delete attr.roundRadius;
            rect.attr(attr);
            this.border = rect;
            return rect;
        };

        this.drawLine = function(attr) {
            var line = this._drawLine(attr);
            obj.lineMembers.push({attr:attr, ele:line});
            return line;
        };

        /**
         * draw a line
         * push line to elements
         * @param  {object} attr x1:0, y1:0, x2:1, y2:0, ...other attr
         * @return {line}      line
         */
        this._drawLine = function(attr) {
            attr = $.extend({}, attr);
            var x1, x2, y1, y2;
            x1 = obj.x + attr.x1;
            x2 = obj.x + obj.width * attr.x2;
            y1 = obj.y + attr.y1;
            y2 = obj.y + obj.height * attr.y2;
            var line = snap.line(x1, y1, x2, y2);

            delete attr.x1;
            delete attr.x2;
            delete attr.y1;
            delete attr.y2;
            line.attr(attr);
            return line;
        };

        // console.log('cell x', x);
        // console.log('cell y', y);
        // console.log('cell width', width);
        // console.log('cell height', height);
    }

    function ToolTip(snap, config) {
        var obj = this;
        var rectEle = null;
        var textBody = null;
        var titleEle = null;
        var contentEles = [];
        var group = snap.group();
        // top right bottom_conner left
        // var downBorderFormat = 'M{x},{y} h{width} v{height} h -{width1} l -{cornerWidth} {cornerWidth} l -{cornerWidth} -{cornerHeight} h -{width1} z';
        var downBorderFormat = 'M 0,0 l {cornerWidth} -{cornerHeight} h {width1} v -{height} h -{width} v {height} h {width1} z';
        var showed = true;
        var conf = {
            base: {
                x: 120,
                y: 120,
                width: 100,
                height: 100,
                cornerWidth: 10,
                cornerHeight: 10
            },
            rectAttr: {
                stroke: '#f7a35c',
                'stroke-width': 1,
                fill: 'rgba(249, 249, 249, .85)',
                transform: ''
            },
            titleAttr: {
                'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                'font-size'  : 11,
                'font-weight': 'bold',
                fill       : '#000',
                transform: 'translate(5 20)',
            },
            contentAttr: {
                'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                'font-size'  : 11,
                fill       : '#000',
                transform: 'translate(5 40)',
            },
        };

        conf = $.extend(true, conf, config);

        this._drawBorder = function() {
            var rectAttr = {
                width1: conf.base.width / 2 - conf.base.cornerHeight
            };
            console.log(rectAttr);
            rectEle = snap.path(Snap.format(downBorderFormat, $.extend(rectAttr, conf.base)));
            rectEle.attr(conf.rectAttr);
            group.add(rectEle);
        };

        this.show = function(show) {
            showed = show;
            var i = 0;
            if (!show) {
                if (rectEle) {
                    rectEle.addClass('hidden');
                }
                if (textBody) {
                    textBody.addClass('hidden');
                }
                if (titleEle) {
                    titleEle.addClass('hidden');
                }
                if (contentEles) {
                    for (i=0; i<contentEles.length; i++) {
                        contentEles[i].addClass('hidden');
                    }
                }
            } else {
                if (rectEle) {
                    rectEle.removeClass('hidden');
                }
                if (textBody) {
                    textBody.removeClass('hidden');
                }
                if (titleEle) {
                    titleEle.removeClass('hidden');
                }
                if (contentEles) {
                    for (i=0; i<contentEles.length; i++) {
                        contentEles[i].removeClass('hidden');
                    }
                }
            }
        };

        this.moveTo = function (x, y) {
            if (!showed){
                return;
            }
            group.attr({
                transform: Snap.format('translate({x}, {y})', {x:x, y:y})
            });
        };

        // example blur
// var f = snap.filter(Snap.filter.blur(5, 5)),
//     c = snap.circle(100, 150, 10).attr({
//         filter: f
//     });
        this.setTitle = function(title) {
            titleEle.node.textContent = title;
        };

        this.setContent = function(content) {
            for (var i=0; i<contentEles.length; i++ ) {
                contentEles[i].remove();
            }
            contentEles = [];
            if (!$.isArray(content)) {
                content = [content];
            }

            for (i=0; i<content.length; i++) {
                var text = snap.text(0 - conf.base.width / 2, 0 - conf.base.height - conf.base.cornerHeight + i * 15, content[i]);
                text.attr(conf.contentAttr);
                contentEles.push(text);
                group.add(text);
            }
            if (!showed){
                this.show(showed);
            }
        };

        this.draw = function() {

        };

        this._init = function() {
            obj._drawBorder();
            titleEle = snap.text(0 - conf.base.width / 2, 0 - conf.base.height - conf.base.cornerHeight, 'title');
            titleEle.attr(conf.titleAttr);
            group.add(titleEle);
        };

        this._init();
    }

    var his = null;
    $(document).ready(function () {
        his = new HisPanel();
        console.log('width=', his.width);
        console.log('height=', his.height);
        console.log('cellCountX=', his.cellCountX);
        console.log('cellCountY=', his.cellCountY);
        console.log('cells=', his.cells);
    });
    $(window).resize( function() {
        if (his) {
            his.redraw();
        }
    });
})(jQuery);
