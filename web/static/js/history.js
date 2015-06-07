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
    var TIMELINECONF = {
        id: '#history',
        cell: {
            base: {
                x: 0,
                y: 0,
                width: 60,
                height: 30
            },
            cellText: {
                base: {
                    content: 'text',
                    align: 'left', //align:'left|middle|right',
                    vAlign: 'center' //vAlign:'top|bottom|center'
                },
                attr: {
                    'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                    'font-size'  : 11,
                    fill       : '#000'
                }
            }
        },
        cellBorder: {
            base: {
                roundRadius: 2
            },
            attr: {
                'fill-opacity': 0,
                stroke: '#0f0',
                strokeWidht: 2
            }
        },
        tlCell: {
            height: 30,
            spanCount: 5,// span count per tl cell
            lineAttr: {
                stroke: '#999',
                'stroke-width': 2
            },
            vLineLength: 5,
            vLineAttr: {
                stroke: '#999',
                'stroke-width': 2
            },
            textSpan: 2,
            spanTextAttr:{
                'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                'font-size'  : 11,
                // stroke     : '#00ff00',
                fill       : '#999'
            }
        },
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
        // must be integer, if > 0, year = year * 10^scale if < 0 second = second / 10 ^(-scale)
        scale: 0,
        cellIcon: {
            base:{
                content:'&#xf21e',
                align:'middle', //align:'left|middle|right',
                vAlign: 'center', //vAlign:'top|bottom|center'
            },
            attr: {
                'font-family':'FontAwesome',
                'font-size': 24,
                fill: '#f00',
                transform: 'translate(0, -3)',
                cursor: 'pointer'
            }
        },
        toolTip:{
            base: {
                x: 0,
                y: 0,
                width: 100,
                height: 70,
                cornerWidth: 6,
                cornerHeight: 6,
                title: 'this is title',
                content:['content1', 'content2']
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
        }
    };
    /**
     * create hispanle
     * @param {[type]} config [description]
     */
    function HisPanel() {
        var obj = this;

        var conf = TIMELINECONF;
        var snap = new Snap('#history');
        // var circle = snap.circle(100, 150, 50);
        // circle.attr({
        //     fill: '#ff0'
        // });
        var container = this.container = $(conf.id);
        this.width = container.innerWidth();
        this.height = container.innerHeight();
        this.cellCountX = this.width / conf.cell.base.width;
        this.cellCountY = this.height / conf.cellHeight;
        this.infoCells = [];
        this.tlCells = [];
        var toolTip = null;

        this._createCellObjs = function() {
            obj.width = container.innerWidth();
            obj.height = container.innerHeight();
            obj.cellCountX = obj.width / conf.cell.base.width;
            obj.cellCountY = Math.floor((obj.height - conf.tlCell.height)/ conf.cell.base.height);
            obj.infoCells = [];
            obj.tlCells = [];
            for (var i=0; i<obj.cellCountX; i++) {
                var cellsY = [];
                for (var j=0; j<obj.cellCountY; j++) {
                    cellsY.push(new HisCell(snap,
                        $.extend(true, conf.cell, {
                            base: {
                                x: i * conf.cell.base.width,
                                y: j* conf.cell.base.height,
                                width: conf.cell.base.width,
                                height: conf.cell.base.height
                            }
                        })
                    ));
                }
                obj.infoCells.push(cellsY);
            }
            for (i=0; i<obj.cellCountX; i++) {
                obj.tlCells.push(new HisCell(snap,
                    $.extend(true, conf.cell, {
                        base: {
                            x: i * conf.cell.base.width,
                            y: obj.cellCountY * conf.cell.base.height,
                            width: conf.cell.base.width,
                            height: conf.tlCell.height
                        }
                    })
                ));
            }
            // create toolTip
            toolTip = new ToolTip(snap, {
                base: {
                    title: 'is a title',
                    content: 'sdlfj'
                }
            });
            toolTip.moveTo(200, 200);
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
            var cell = this.getInfoCell(0, 3);
            cell.fillText({base: {
                content:'test', align:'middle', vAlign:'center'}})
            .drawBorder( {
                base: {
                    roundRadius: 2
                }
            });
            this.getInfoCell(2, 4)
            .drawBorder( {
                base: {
                    roundRadius: 2
                }
            })
            .drawIcon({base:{content:'&#xf21e'}})
            .setToolTip(toolTip, {base:{title:'hello'}});
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
         * set a tooltip
         * @param {json} attr see TIMELINECONF.toolTip
         */
        this.setCellToolTip = function(cell, attr) {
            if (cell) {
                cell.setToolTip(toolTip, attr);
            }
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
                cell.drawLine({
                    base: {
                        x1:0, y1:0, x2:1, y2:0
                    },
                    attr: conf.tlCell.lineAttr
                });
                var tlSpanX = conf.cell.base.width / conf.tlCell.spanCount;
                var tlSpanHeightScale = conf.tlCell.vLineLength / conf.tlCell.height;
                // 画刻度
                for (var j=0; j<conf.tlCell.spanCount; j++) {
                    var y2 = j === 0 && i % conf.tlCell.textSpan === 0 ? tlSpanHeightScale * 2 : tlSpanHeightScale;
                    cell.drawLine({
                            base: {
                                x1:tlSpanX * j, y1:0, x2: j/conf.tlCell.spanCount, y2:y2
                            },
                            attr: conf.tlCell.vLineAttr
                    });
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
                // console.log(oneSpanTime);
                for (var i = 0; i < obj.tlCells.length; i++) {
                    var cell = obj.tlCells[i];
                    // 画文字
                    if (scale === undefined || scale === 0) {
                        if ( i % conf.tlCell.textSpan === 0) {
                            var date = new Date(d1.getTime() + i * oneSpanTime);
                            // console.log(date);
                            var content = date.toFormat('YYYY-MM-DD');
                            // spanTextAttr = $.extend(spanTextAttr, );
                            cell.fillText({
                                base: {content: content, align:'left', vAlign:'bottom'},
                                attr: conf.tlCell.spanTextAttr
                            });
                        }
                    }
                }
            }
        };
        // call init
        this._init();
        this._draw();
    }

    function HisCell(snap, attr) {
        var obj = this;
        var conf = $.extend(true, {}, attr);
        this.x = conf.base.x;
        this.y = conf.base.y;
        this.width = conf.base.width;
        this.height = conf.base.height;
        // all member like this {attr: creatAttr, ele: the element}
        this.textMembers = [];
        this.lineMembers = [];
        this.borderMembers = [];
        var toolTip = null;
        var toolTipAttr = null;

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
         * fill text with attr
         * @param  {object} attr like {base:{content:'a content', align:'left|middle|right', vAlign:'top|bottom|center'}, attr::{}}
         * @return {element} the text element
         */
        this.fillText = function(attr) {
            var textConf = $.extend(true, conf.cellText, attr);
            var fontSize = 12;
            if (textConf.attr['font-size']) {
                fontSize = parseInt(textConf.attr['font-size']);
            }
            var tx = obj.x + obj.width / 2;
            var ty = obj.y + obj.height/ 2 + fontSize / 2;
            if (textConf.base.align === 'middle') {
                textConf.attr['text-anchor'] = 'middle';
            } else if (textConf.base.align === 'right') {
                tx = obj.x + obj.width;
                textConf.attr['text-anchor'] = 'end';
            } else {
                tx = obj.x;
                textConf.attr['text-anchor'] = 'start';
            }
            if (textConf.base.vAlign === 'bottom') {
                ty = obj.y + obj.height;
            } else if (textConf.base.vAlign === 'top') {
                ty = obj.y + fontSize / 2;
            }

            var text = snap.text(tx, ty, attr.base.content);
            text.attr(textConf.attr);
            obj.textMembers.push({attr:textConf, ele: text});
            return obj;
        };

        /**
         * get center point
         * @return {object} {x: number(x), y: number{y}}
         */
        this.getCenter = function() {
            return {x: this.x + this.width / 2, y: this.y + this.height / 2};
        };

        /**
         * draw a border of the cell
         * @param  {json} attr {base:{roundRadius:,}, attr:{}}
         * @return {[type]}      [description]
         */
        this.drawBorder = function(attr) {
            var borderConf = $.extend(true, TIMELINECONF.cellBorder, attr);
            var rect = snap.rect(this.x, this.y, this.width, this.height, borderConf.base.roundRadius ? borderConf.base.roundRadius:0);
            rect.attr(borderConf.attr);
            this.border = rect;
            obj.borderMembers.push({attr:borderConf, ele:rect});
            return obj;
        };

        /**
         * draw a line
         * @param  {json} attr {base:{x1:,y1:,x2:,y2}, attr:{}}
         * @return {this}
         */
        this.drawLine = function(attr) {
            var lineConf = $.extend({}, attr);
            var x1, x2, y1, y2;
            x1 = obj.x + lineConf.base.x1;
            x2 = obj.x + obj.width * lineConf.base.x2;
            y1 = obj.y + lineConf.base.y1;
            y2 = obj.y + obj.height * lineConf.base.y2;
            var line = snap.line(x1, y1, x2, y2);

            line.attr(lineConf.attr);
            obj.lineMembers.push({attr:lineConf, ele:line});
            return obj;
        };

        this.drawIcon = function(attr) {
            var textConf = $.extend(true, TIMELINECONF.cellIcon, attr);
            console.log(textConf);
            var fontSize = 12;
            if (textConf.attr['font-size']) {
                fontSize = parseInt(textConf.attr['font-size']);
            }
            var tx = obj.x + obj.width / 2;
            var ty = obj.y + obj.height/ 2 + fontSize / 2;
            if (textConf.base.align === 'middle') {
                textConf.attr['text-anchor'] = 'middle';
            } else if (textConf.base.align === 'right') {
                tx = obj.x + obj.width;
                textConf.attr['text-anchor'] = 'end';
            } else {
                tx = obj.x;
                textConf.attr['text-anchor'] = 'start';
            }
            if (textConf.base.vAlign === 'bottom') {
                ty = obj.y + obj.height;
            } else if (textConf.base.vAlign === 'top') {
                ty = obj.y + fontSize / 2;
            }

            var text = snap.text(tx, ty, '');
            $(text.node).html(textConf.base.content);
            text.attr(textConf.attr);
            obj.textMembers.push({attr:textConf, ele:text});
            return obj;
        };

        function onmouseover() {
            var point = obj.getCenter();
            toolTip.moveTo(point.x, obj.y);
            toolTip.show(true);
        }

        function onmouseout() {
            toolTip.show(false);
        }

        this.setToolTip = function(paper, attr) {
            toolTip = paper;
            toolTipAttr = attr;
            if (this.textMembers) {
                for (var i=0; i<this.textMembers.length; i++) {
                    console.log(this.textMembers[i].ele);
                    this.textMembers[i].ele.node.onmouseover =onmouseover;
                    this.textMembers[i].ele.node.onmouseout = onmouseout;
                }
            }
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
        var conf = $.extend(true, TIMELINECONF.toolTip, config);
        console.log(TIMELINECONF.toolTip);

        this._drawBorder = function() {
            var rectAttr = {
                width1: conf.base.width / 2 - conf.base.cornerHeight
            };
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
