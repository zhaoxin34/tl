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
                height: 60
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
                fill: '#128cd1',
                transform: 'translate(0, -3)',
                cursor: 'pointer'
            },
            border: {
                lighter: 50,
                'font-size': 28
            }
        },
        toolTip:{
            base: {
                x: 0,
                y: 0,
                width: 100,
                height: 70,
                cornerWidth: 0,
                cornerHeight: 0,
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
                'style': 'pointer-events: none;'
            },
            contentAttr: {
                'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                'font-size'  : 11,
                fill       : '#000',
                transform: 'translate(5 40)',
                'style': 'pointer-events: none;'
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
        var clientInfo = {
            width: this.width,
            height: this.height
        };
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
                        $.extend(true, {}, conf.cell, {
                            base: {
                                x: i * conf.cell.base.width,
                                y: j* conf.cell.base.height,
                                width: conf.cell.base.width,
                                height: conf.cell.base.height
                            },
                            clientInfo: clientInfo
                        })
                    ));
                }
                obj.infoCells.push(cellsY);
            }
            for (i=0; i<obj.cellCountX; i++) {
                obj.tlCells.push(new HisCell(snap,
                    $.extend(true, {}, conf.cell, {
                        base: {
                            x: i * conf.cell.base.width,
                            y: obj.cellCountY * conf.cell.base.height,
                            width: conf.cell.base.width,
                            height: conf.tlCell.height
                        },
                        clientInfo: clientInfo
                    })
                ));
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
            toolTip.destroy();
        };

        /**
         * draw the panel, must after _init
         * @return {[type]} [description]
         */
        this._draw = function() {
            this.drawTimeLine();
            // create toolTip
            toolTip = new ToolTip(snap, {});

            // test
            // var cell = this.getInfoCell(0, 1);
            // cell.fillText({base: {
            //     content:'test', align:'middle', vAlign:'center'}})
            // .drawBorder( {
            //     base: {
            //         roundRadius: 2
            //     }
            // });
            // this.getInfoCell(18, 2)
            // .drawBorder( {
            //     base: {
            //         roundRadius: 2
            //     }
            // })
            // // .drawIcon({base:{content:'&#xf21e'}, attr: {fill: '#faa', 'font-size': 28}})
            // .drawIcon({base:{content:'&#xf21e'}})
            // .setToolTip(toolTip,  $.extend(
            //     true, {}, conf.toolTip,
            //     {base:{title:'hello', content:['this is content1', 'this is content2']}}));
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
         * set a toolTip
         * @param {json} attr see TIMELINECONF.toolTip
         */
        this.setCellToolTip = function(cell, attr) {
            if (cell) {
                cell.setToolTip(toolTip, $.extend(true, {}, conf.toolTip, attr));
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
        // text element
        var textEle;
        this.lineMembers = [];
        this.borderMembers = [];
        var clientInfo = attr.clientInfo;
        // Snap.group()
        var iconGroup = null;
        var toolTip = null;
        var toolTipAttr = null;

        this.destroy = function() {
            if (textEle){
                textEle.remove();
            }
            obj._removeMembers(this.lineMembers);
            obj.lineMembers = [];
            obj._removeMembers(this.borderMembers);
            obj.borderMembers = [];
            if (iconGroup) {
                iconGroup.remove();
            }
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
            // remove last
            if (textEle){
                textEle.remove();
            }
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
            textEle = text;
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
            var borderConf = $.extend(true, {}, TIMELINECONF.cellBorder, attr);
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
            var textConf = $.extend(true, {}, TIMELINECONF.cellIcon, attr);
            var fontSize = 12;
            textConf.attr['text-anchor'] = 'middle';

            // clear last icon
            if(iconGroup) {
                iconGroup.remove();
            }
            iconGroup = snap.group();
            // draw icon border
            if (textConf.border['font-size']) {
                fontSize = parseInt(textConf.border['font-size']);
            }
            var tx = obj.x + obj.width / 2;
            var ty = obj.y + obj.height/ 2 + fontSize / 2;
            var text = snap.text(tx, ty, '');
            $(text.node).html(textConf.base.content);
            var fill = '#000';
            if (textConf.attr.fill){
                fill = textConf.attr.fill;
            }
            var lighterColor = $.lighter(fill, textConf.border.lighter);
            text.attr($.extend(true, {}, textConf.attr, {fill: lighterColor,
                'font-size': textConf.border['font-size'],
                'text-anchor': 'middle',
                'fill-opacity': 0.5}));
            text.addClass('hidden');
            iconGroup.add(text);

            if (textConf.attr['font-size']) {
                fontSize = parseInt(textConf.attr['font-size']);
            }
            ty = obj.y + obj.height/ 2 + fontSize / 2;
            text = snap.text(tx, ty, '');
            $(text.node).html(textConf.base.content);
            text.attr(textConf.attr);
            iconGroup.add(text);
            return obj;
        };

        /**
         * mouse move on icon
         * action: show border show toolTip
         * @return {}
         */
        function onmousemove() {
            var point = obj.getCenter();
            // get the a panel point
            if (obj.x < clientInfo.width / 2) {
               point.x = point.x + obj.width / 2 + toolTipAttr.base.width / 2;
            } else {
                point.x = point.x - obj.width / 2 - toolTipAttr.base.width / 2 ;
            }
            point.y = obj.y + toolTipAttr.base.height / 2 + obj.width / 2;
            if (point.y < toolTipAttr.base.height) {
                point.y = toolTipAttr.base.height + 5;
            }
            toolTip.moveTo(point.x, point.y);
            // toolTip.setAttr(toolTipAttr);
            toolTip.show(true);
            if (iconGroup && iconGroup.select('text:nth-child(1).hidden')) {
                iconGroup.select('text:nth-child(1).hidden').removeClass('hidden');
            }
        }

        /**
         * mouse move out the icon event handler
         *
         * @return {}
         */
        function onmouseout() {
            // why setTimeout? because i want the mouse have the chance to move on the toolTip at that time
            window.setTimeout(function() {
                toolTip.show(false);
                if (iconGroup && iconGroup.select('text:nth-child(1)')) {
                    iconGroup.select('text:nth-child(1)').addClass('hidden');
                }
            }, 200);
        }

        /**
         * set tool tip content title and other profile
         * @param {object} paper the ToolTip object
         * @param {void} attr
         */
        this.setToolTip = function(paper, attr) {
            toolTip = paper;
            toolTipAttr = attr;
            paper.setTitle(attr.base.title);
            paper.setContent(attr.base.content);
            // child2 is the icon, child1 is the border
            if (iconGroup && iconGroup.select('text:nth-child(2)')) {
                iconGroup.select('text:nth-child(2)').node.onmousemove =onmousemove;
                iconGroup.select('text:nth-child(2)').node.onmouseout = onmouseout;
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
        var conf = $.extend(true, {}, TIMELINECONF.toolTip, config);
        // is the cursor in the rect
        var cursorIn = false;
        // use element
        var toolTipUse = null;
        group.attr({id:'toolTip'});

        this._drawBorder = function() {
            var rectAttr = {
                width1: conf.base.width / 2 - conf.base.cornerHeight
            };
            rectEle = snap.path(Snap.format(downBorderFormat, $.extend(rectAttr, conf.base)));
            rectEle.attr(conf.rectAttr);
            rectEle.mousemove(function() {
                cursorIn = true;
            });
            rectEle.mouseout(function() {
                cursorIn = false;
                obj.show(false);
            });
            group.add(rectEle);
        };

        this.getBase = function() {

        };

        this.show = function(show) {
            if (cursorIn){
                return;
            }

            var i = 0;
            if (!show) {
                if (toolTipUse) {
                    toolTipUse.remove();
                    toolTipUse = null;
                }
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
            } else if (!showed) {
               // if (uses) {
               //   for (var i = 0; i < uses.length; i++) {
               //       var use = uses[i];
               //       if (use.node.attributes.href && use.node.attributes.href.value === '#toolTip') {
               //           needUse = false;
               //           break;
               //           }
               //       }
               //   }
               //   console.log('need use', needUse);

                if (!toolTipUse) {
                    toolTipUse = snap.use('toolTip');
                }
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
            showed = show;
        };

        this.moveTo = function (x, y) {
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
            group.toDefs();
        };

        this.destroy = function() {
            group.remove();
        };
        this._init();
    }

    var his = null;
    $(document).ready(function () {
        his = new HisPanel();
        var start = parseInt('0xf001');
        var end = parseInt('0xf193');
        for (var i=0; i<his.cellCountX; i++) {
            for (var j=0; j<his.cellCountY; j++) {
                var cell = his.getInfoCell(i, j);
                if (Math.random()> 0.5) {
                    var suffix = parseInt(Math.random() * (end - start) + start);
                    var content = '&#x' + (suffix).toString(16);
                    console.log(content);
                    cell.drawIcon({base:{content:content}});
                    his.setCellToolTip(cell, {title:'a title', content:'wori wori'});
                }
            }
        }
        his.getInfoCell(2,1).fillText();
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
