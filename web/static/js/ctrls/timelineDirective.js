'use strict';

tlApp.directive('timeline', function($compile) {
    var options = {
        handlers: {
            laodStory: null, // 设置读取故事的处理器
        },
        hisPanel: {
            height: 400,
            maxDatetime: '2016-01-01',
            minDatetime: '2000-01-01',
            currentDatetime: '2016-03-19', // 现在时间, null 代表现在
            css: {},
            'clazz': 'tl-his',

            zoomOptions: {
                top: 0,
                width: 120,
                height: 32,
                zoomScales:['hours', 'days', 'weeks', 'months', 'years'],
                css: {
                    'z-index': 100001
                }
            },
            /** @type {options} timeline options */
            timelineOptions: {
                height: 38,
                css: {
                    overflow: 'hidden',
                    cursor: 'move'
                },
                clazz: 'tl-timeline',
                timelineSliceOptions: {
                    // 刻度
                    timeUnitPx: 20, // 最小的刻度像素
                    timeUnitSpan: 'hours', // 最小刻度的时间跨度
                    timeUnitVLineWidthPx: 2, // 刻度竖线宽度
                    timeUnitVLineHeightPx: 10, // 刻度竖线高度
                    timeUnitCss: {
                    },
                    timeUnitClazz: 'tl-timeline-unit',
                    css: {

                    }
                }
            },
            /** @type {options} story options */
            storyOptions: {
                height: 360,
                css: {
                    'overflow': 'hidden'
                },
                clazz: 'tl-story',
                storyWidgetOptions: {
                    css: {},
                    // 旗杆
                    flagRoll: {
                        minLength: 8,
                        css: {},
                        clazz: 'tl-story-flag-roll'
                    },
                    // 旗
                    flag: {
                        width: 180,
                        tailWidth: 20,
                        tailClazz: 'tl-story-flag-tail',
                        height: 80,
                        css: {
                            'padding-right': '20px',
                            'overflow': 'hidden'
                        },
                        clazz: 'tl-story-flag'
                    },
                    eventBox: {
                        perEventWidth: 200,
                        margin:4,
                        css: {
                            'overflow': 'hidden'
                        },
                        clazz: 'tl-story-eventbox'
                    },
                    flagTop: {
                        bulgeLength: 5,
                        ballRadius: 8,
                        ballCss: {
                            'border-radius': '50%'
                        },
                        clazz: 'tl-story-flag-top'
                    }
                }
            }
        }// end hisPanel
    };

    function LinkedNode() {
        this.next;
        this.prev;
        this.data;
    }

    function LinkedList() {
        var first;
        var last;
        this.add = function(data) {
            var newNode = new LinkedNode();
            newNode.data = data;
            if (first) {
                first.next = newNode;
                newNode.prev = first;
            }
            if (!last) {
                last = newNode;
            }
            first = newNode;
        };
        this.addLast = function(data) {
            var newNode = new LinkedNode();
            newNode.data = data;
            if (last) {
                last.prev = newNode;
                newNode.next = last;
            }
            if (!first) {
                first = newNode;
            }
            last = newNode;
        };
        this.first = function() {
            if (first) {
                return first.data;
            }
        };
        this.last = function() {
            if (last) {
                return last.data;
            }
        };
        this.removeFirst = function() {
            if (first) {
                var removeNode = first;
                if (first.prev) {
                    first.prev.next = null;
                    first = first.prev;
                } else {
                    first = null;
                    last = null;
                }
                return removeNode.data;
            }
        };
        this.removeLast = function() {
            if (last) {
                var removeNode = last;
                if (last.next) {
                    last.next.prev = null;
                    last = last.next;
                } else {
                    last = null;
                    first = null;
                }
                return removeNode.data;
            }
        };

        this.foreach = function(loopfunc) {
            var cur = last;
            while (cur) {
                loopfunc(cur.data);
                cur = cur.next;
            }
        };
    } // end linkedlist

    var Panel = Class.extend({
        init: function(id, panel, container, clientInfo, options) {
            console.log('panel init');
            this.fatherPanel = panel;
            this.clientInfo = $(clientInfo);
            this.options = options;
            this.clientInfo = clientInfo;
            this.container = container;
            this.childrenPanel = new LinkedList();
            this.id = id;
            if (panel == null) {
                container.css({'position': 'relative'});
            }
            this.create();
        },
        addChildPanel: function(childPanel) {
            this.childrenPanel.add(childPanel);
        },
        onDragging: function(e, fixX, fixY) {
            var dx = 0, dy = 0;
            if (!fixX) {
                dx = e.clientX - this.dragBeginPostion.clientX;
            }
            if (!fixY){
                dy = e.clientY - this.dragBeginPostion.clientY;
            }
            this.moveTo(this.dragBeginPostion.left + dx, this.dragBeginPostion.top + dy);
        },
        onDragEnd: function(e) {
        },
        onDragBegin: function(e) {
            this.dragBeginPostion = {
                left: this.client.position().left,
                top: this.client.position().top,
                clientX: e.clientX,
                clientY: e.clientY
            };
        },
        moveTo: function(left, top) {
            this.clientInfo.left = left;
            this.clientInfo.top = top;
            this.client.css({left: left, top: top});
        },
        create: function() {
            var options = this.options;
            var container = this.container;
            var clientInfo = this.clientInfo;
            var client = $('<div style="position: absolute;"></div>');

            client.attr('id', this.id);

            if (options.css) {
                client.css(options.css);
            }
            if (options.css) {
                client.addClass(options.clazz);
            }
            client.css($.extend({}, clientInfo, {position:'absolute'}));
            container.append(client);
            this.client = client;
        },
        drag:function() {
            var obj = this;
            var client = this.client;
            client.mousedown(function(e) {
                obj.isDragging = true;
                obj.onDragBegin(e);
            })
            .mousemove(function(e) {
                if (obj.isDragging) {
                    obj.onDragging(e);
                }
             })
            .mouseup(function(e) {
                if (obj.isDragging) {
                    obj.isDragging = false;
                    obj.onDragEnd(e);
                }
            })
            .mouseleave(function(e) {
                if (obj.isDragging) {
                    obj.isDragging = false;
                    obj.onDragEnd(e);
                }
            });
        },
        destory: function() {
            this.childrenPanel.foreach(function(panel){
                panel.destory();
            });
            this.client.remove();
        },
        createRect: function(rect, css, clazz) {
            var rectEle = $('<div></div>');
            if (css) {
                rectEle.css(css);
            }
            if (clazz) {
                rectEle.addClass(clazz);
            }
            rectEle.css($.extend({}, rect, {position:'absolute'}));
            this.client.append(rectEle);
            return rectEle;
        },
        createCircle: function(circle, css, clazz) {
            return this.createRect({
                left: circle.x - circle.r,
                top: circle.y - circle.r,
                width: 2 * circle.r,
                height: 2 * circle.r
            }, css, clazz);
        },
        fireFatherEvent: function(eventName, args) {
            if (this.fatherPanel) {
                this.fatherPanel[eventName].apply(this.fatherPanel, args);
            }
        },
        fireGrandpaEvent: function(eventName, args) {
            if (this.fatherPanel && this.fatherPanel.fatherPanel) {
                this.fatherPanel.fatherPanel[eventName].apply(this.fatherPanel.fatherPanel, args);
            }
        }
    });

    var HisPanel = Panel.extend({
        init: function(id, container, options) {
            var clientInfo = {
                left: 0, top: 0, width: container.innerWidth(), height: container.innerHeight()
            };
            clientInfo.height = options.height? options.height : clientInfo.height;
            clientInfo.width = options.width? options.width : clientInfo.width;
            this.loadStoryCallback = options.handlers.loadStory;
            this._super(id, null, container, clientInfo, options);
        },
        create: function() {
            this._super();
            var clientInfo = this.clientInfo;
            var options = this.options;
            // 设置现在、开始、结束时间
            this.currentDatetime = new Date();
            if (options.currentDatetime) {
                this.currentDatetime = new Date(options.currentDatetime);
            }
            if (options.maxDatetime) {
                this.maxDatetime = new Date(options.maxDatetime);
            }
            if (this.maxDatetime && this.maxDatetime.getTime() < this.currentDatetime.getTime()) {
                this.maxDatetime = this.currentDatetime;
            }
            if (options.minDatetime) {
                this.minDatetime = new Date(options.minDatetime);
            }
            if (this.minDatetime && this.minDatetime.getTime() > this.currentDatetime.getTime()) {
                this.minDatetime = this.currentDatetime;
            }

            var timelineOptions = options.timelineOptions;
            var timelineClientInfo = {
                left: clientInfo.left,
                top: clientInfo.height - timelineOptions.height,
                width: clientInfo.width,
                height: timelineOptions.height
            };

            var storyOptions = options.storyOptions;
            var storyClientInfo = {
                left: clientInfo.left,
                top: clientInfo.top,
                width: clientInfo.width,
                height: storyOptions.height
            };
            var storyPanel = new StoryPanel('story', this, this.client, storyClientInfo, storyOptions);
            this.addChildPanel(storyPanel);
            this.storyPanel = storyPanel;

            var timelinePanel = new TimelinePanel('timeline', this, this.client, timelineClientInfo, timelineOptions);
            this.addChildPanel(timelinePanel);

            var zoomOptions = options.zoomOptions;
            var zoomClientInfo = {
                left: clientInfo.width / 2 - zoomOptions.width / 2,
                top: zoomOptions.top,
                width: zoomOptions.width,
                height: zoomOptions.height
            };

            var zoomPanel = new ZoomPanel('zoom', this, this.client, zoomClientInfo, zoomOptions);
            this.addChildPanel(zoomPanel);
        },
        onLoadTimeline: function(startMoment, endMoment, left, right){
            var storyList = this.loadStoryCallback(startMoment, endMoment);
            this.storyPanel.loadStory(startMoment, endMoment, left, right, storyList);
        },
        onUnloadTimeline: function(startMoment, endMoment, left, right){
            console.log(arguments);
        },
        onTimelineDragging: function(e) {
            this.storyPanel.onDragging(e);
        },
        onTimelineDragBegin: function(e) {
            this.storyPanel.onDragBegin(e);
        },
        onTimelineDragEnd: function(e) {
            this.storyPanel.onDragEnd(e);
        },
        onZoom: function(inOrOut) {
            var zoomScales = this.options.zoomOptions.zoomScales;
            var curZoomScale = this.options.timelineOptions.timelineSliceOptions.timeUnitSpan;
            var i=0;
            for (i=0; i<zoomScales.length; i++) {
                if (zoomScales[i] == curZoomScale){
                    break;
                }
            }
            if (inOrOut) {
                i++;
            } else{
                i--;
            }
            if (i<0 || i>= zoomScales.length){
                return;
            }

            this.options.timelineOptions.timelineSliceOptions.timeUnitSpan = zoomScales[i];

            this.destory();
            this.create();
        }
    });

    var ZoomPanel = Panel.extend({
        template: '  <ul class="tl-zoom"><li><i class="fa fa-minus-circle"></i></li><li><i class="fa fa-plus-circle"></i></li></ul>',
        create: function() {
            this._super();
            var obj = this;
            var client = this.client;
            var ele = $(this.template);
            client.append(ele);
            ele.find('li').hover(function(){
                $(this).find('.fa').css('font-size', '24px');
            }, function() {
                $(this).find('.fa').css('font-size', '18px');
            });
            ele.find('.fa-minus-circle').parent().click(function() {
                obj.fireFatherEvent('onZoom', [true]);
            });
            ele.find('.fa-plus-circle').parent().click(function() {
                obj.fireFatherEvent('onZoom', [false]);
            });
        }
    });

    var TimelinePanel = Panel.extend({
        create: function() {
            this._super();
            this.offsetDx = 0;
            this.createTimelineSlice();
        },
        createTimelineSlice: function() {
            this.timelineSliceList = new LinkedList();
            // 循环三次，做三个x轴
            for (var i=-1;i<3;i++) {
                this.createOneTimelineSlice(i);
            }
            this.drag();
        },
        createOneTimelineSlice: function(offset) {
            var clientInfo = this.clientInfo;
            var options = this.options;
            var fatherPanel = this.fatherPanel;
            // 一屏总共的竖线个数
            var spanCount = parseInt(clientInfo.width / options.timelineSliceOptions.timeUnitPx);

            var currentMoment = moment(fatherPanel.currentDatetime);
            if (['weeks', 'years', 'hours', 'days', 'months'].indexOf(options.timelineSliceOptions.timeUnitSpan) >= 0) {
                currentMoment.hour(0);
                currentMoment.minute(0);
                currentMoment.second(0);
                currentMoment.millisecond(0);
            }
            var endMoment = currentMoment.clone().add(offset * spanCount, options.timelineSliceOptions.timeUnitSpan);
            var startMoment = endMoment.clone().add(-spanCount, options.timelineSliceOptions.timeUnitSpan);
            // 每一段坐标轴的宽度
            var oneXLength = spanCount * options.timelineSliceOptions.timeUnitPx;
            var oneClientInfo = {
                left: -0.5 * oneXLength + oneXLength * offset + this.offsetDx,
                top: 0,
                width: spanCount * options.timelineSliceOptions.timeUnitPx,
                height: clientInfo.height
            };
            var timelineSlicePanel = new TimelineSlicePanel('timeline_slice_' + offset, this, this.client, oneClientInfo, options.timelineSliceOptions, startMoment, endMoment, offset);
            if (!this.timelineSliceList.first() || offset > this.timelineSliceList.first().offset) {
                this.timelineSliceList.add(timelineSlicePanel);
            } else if (offset < this.timelineSliceList.last().offset) {
                this.timelineSliceList.addLast(timelineSlicePanel);
            } else {
                console.log('add timelineSlicePanel error, offset number error');
            }
            return timelineSlicePanel;
        },
        onDragBegin: function(e){
            this._super(e);
            this.beginOffsetDx = this.offsetDx;
            this.timelineSliceList.foreach(function(panel){
                panel.onDragBegin(e);
            });
            this.fireFatherEvent('onTimelineDragBegin', [e]);
        },
        onDragEnd: function(e) {
            this._super(e);
            this.timelineSliceList.foreach(function(panel){
                panel.onDragEnd(e);
            });
            // 增减timelien slice
            // 向左拖住啊x
            if ('left' === this.dragEndDirection) {
                var first = this.timelineSliceList.first();
                var last = this.timelineSliceList.last();
                if (first.clientInfo.left <= this.clientInfo.width) {
                    // 开始生成并读取右边的坐标轴和数据
                    var timelineSlice = this.createOneTimelineSlice(first.offset + 1);
                    // 开始删除左边坐标轴
                    if (Math.abs(first.offset - last.offset) > 4) {
                        this.timelineSliceList.removeLast().destory();
                    }
                }
            }
            // 向右
            else if ('right' === this.dragEndDirection) {
                var first = this.timelineSliceList.first();
                var last = this.timelineSliceList.last();
                if (last.clientInfo.left >= -this.clientInfo.width) {
                    // 开始生成并读取右边的坐标轴和数据
                    var timelineSlice = this.createOneTimelineSlice(last.offset - 1);
                    // 开始删除左边坐标轴
                    if (Math.abs(first.offset - last.offset) > 4) {
                        this.timelineSliceList.removeFirst().destory();
                    }
                }
            }
            this.fireFatherEvent('onTimelineDragEnd', [e]);
        },
        onDragging: function(e) {
            var dx = e.clientX - this.dragBeginPostion.clientX;
            this.offsetDx = this.beginOffsetDx + dx;
            this.timelineSliceList.foreach(function(panel){
                panel.moveTo(panel.dragBeginPostion.left + dx, panel.dragBeginPostion.top);
            });
            if (dx < 0){this.dragEndDirection = 'left'; }
            else if (dx >0){this.dragEndDirection = 'right'; }
            else { this.dragEndDirection = ''; }
            this.fireFatherEvent('onTimelineDragging', [e]);
        }
    });

    var TimelineSlicePanel = Panel.extend({
        init: function(id, panel, container, clientInfo, options, startMoment, endMoment, offset) {
            this.offset = offset;
            this.startMoment = startMoment;
            this.endMoment = endMoment;
            this._super(id, panel, container, clientInfo, options);
        },
        create: function() {
            this._super();
            this._createScales();
            this.fireGrandpaEvent('onLoadTimeline', [this.startMoment, this.endMoment, this.clientInfo.left, this.clientInfo.left + this.clientInfo.width]);
        },
        destory: function() {
            this._super();
            this.fireGrandpaEvent('onUnloadTimeline', [this.startMoment, this.endMoment, this.clientInfo.left, this.clientInfo.left + this.clientInfo.width]);
        },
        _createScales: function() {
            var clientInfo = this.clientInfo;
            var options = this.options;
            for (var i=0; i<clientInfo.width / options.timeUnitPx; i++) {
                var scaleRect = {
                    left: i * options.timeUnitPx,
                    top: 0,
                    width: options.timeUnitVLineWidthPx,
                    height:options.timeUnitVLineHeightPx
                };
                var rectEle = this.createRect(scaleRect, options.timeUnitCss, options.timeUnitClazz);
                // 把刻度加入数组
                var scale = {
                    i: i,
                    rect: scaleRect,
                    ele: rectEle,
                    moment: this.startMoment.clone().add(i, options.timeUnitSpan)
                };
                this._afterDrawScale(scale);
            }
        },
        _afterDrawScale: function(scale) {
            var client = this.client;
            var options = this.options;

            function createText(text) {
                // 将刻度变长
                scale.ele.css({'height': options.timeUnitVLineHeightPx*3});
                // 刻字
                var textEle  = $('<span></spa>');
                textEle.text(text);
                textEle.css({
                    left: scale.rect.left + options.timeUnitVLineWidthPx,
                    top: scale.rect.top + options.timeUnitVLineHeightPx*2 -4,
                    position: 'absolute'
                });
                client.append(textEle);
            }

            // 按照月的精度画文字
            if (options.timeUnitSpan === 'months') {
                // 如果要画文字
                if (scale.moment.month() === 0) {
                    createText(scale.moment.format('YYYY.MM'));
                }
            }
            else if (options.timeUnitSpan === 'weeks') {
                if (scale.moment.week() % 10 === 0) {
                    createText(scale.moment.format('MM.DD'));
                }
            }
            else if (options.timeUnitSpan === 'hours') {
                if (scale.moment.hour() === 0) {
                    createText(scale.moment.format('MM.DD'));
                }
            }
            // 按照天的精度
            else if (options.timeUnitSpan === 'days') {
                if (scale.moment.date() === 1 || scale.moment.date() ===15) {
                    createText(scale.moment.format('MM.DD'));
                }
            }
            // 精度为年
            else if (options.timeUnitSpan === 'years') {
                if (scale.moment.year() % 10 === 0 ) {
                    createText(scale.moment.format('YYYY'));
                }
            }
        }
    });

    function getXByDate(startMoment, endMoment, left, right, date) {
        var per = (right -left) / (endMoment.toDate().getTime() - startMoment.toDate().getTime());
        var dateSpan = date.getTime() - startMoment.toDate().getTime();
        return parseInt(left + dateSpan * per);
    }

    var StoryPanel = Panel.extend({
        /**
         * 读取故事
         * @param  {moment} startMoment
         * @param  {moment} endMoment
         * @param  {int} left        timeline left
         * @param  {int} right       timelien right
         * @param  {array} storyList   story list
         * @return {void}
         */
        loadStory: function(startMoment, endMoment, left, right, storyList) {
            var clientInfo = this.clientInfo;
            var options = this.options;
            var storyVCount = parseInt(clientInfo.height / (options.storyWidgetOptions.flag.height +
                    options.storyWidgetOptions.flagRoll.minLength + options.storyWidgetOptions.flagTop.ballRadius*2 +
                    options.storyWidgetOptions.flagTop.bulgeLength));
            var oneFloorHeight = parseInt(clientInfo.height / storyVCount);
            if (!this.story2Arr) {
                this.story2Arr = [];
            }
            var story2Arr = this.story2Arr;// 二维数组，第一维是层，第二维是storyWidget的clientInfo

            for (var i=0; i< storyList.length; i++) {
                var story = storyList[i];
                // console.log(story);
                if (story.startDatetime) {
                    story.startDatetime = new Date(story.startDatetime);
                }
                if (story.endDatetime) {
                    story.endDatetime = new Date(story.endDatetime);
                }
                var storyLeft = getXByDate(startMoment, endMoment, left, right, story.startDatetime);
                var storyRight = storyLeft + options.storyWidgetOptions.flag.width;
                if (story.endDatetime) {
                    storyRight = Math.max(getXByDate(startMoment, endMoment, left, right, story.endDatetime), storyRight);
                }

                // 不在当前范围
                if (storyLeft < left || storyLeft >= right){
                    continue;
                }
                var floor = 0; // 层数
                outer: for (var f=0; f<storyVCount; f++) {
                    if (f in story2Arr) {
                        for (var ff=0; ff< story2Arr[f].length; ff++) {
                            var cl = story2Arr[f][ff];
                            if (!this._isXOverlap(storyLeft, storyRight, cl.left, cl.left + cl.width)) {
                                floor = f;
                                break outer;
                            }
                        }
                    } else {
                        floor = f;
                        break outer;
                    }
                }
                var flagWidgetHeight = (floor+1) * oneFloorHeight;
                var flagWidgetClientInfo = {
                    left: storyLeft,
                    top: clientInfo.height - flagWidgetHeight,
                    width: Math.max((storyRight - storyLeft), (options.storyWidgetOptions.flag.width + options.storyWidgetOptions.eventBox.perEventWidth)),
                    height: flagWidgetHeight
                };
                if (!(floor in story2Arr)) {
                    story2Arr[floor] = [];
                }
                story2Arr[floor].push(flagWidgetClientInfo);
                console.log(story2Arr);
                var  storyWidgetPanel = new StoryWidgetPanel('story_widget_' + story.id, this, this.client,
                        flagWidgetClientInfo, options.storyWidgetOptions, story,
                        {startMoment: startMoment, endMoment: endMoment, left: left, right: right});
                // storyWidgetPanel.drag();
                this.addChildPanel(storyWidgetPanel);
            }
        },
        _isXOverlap: function(left1, right1, left2, right2) {
            if ((left1 >= left2 && left1 <= right2) || (right1 >= left2 && right1 <= right2)) {
                return true;
            }
            return false;
        },
        /**
         * 判断时间是否重叠
         * @return {Boolean}                是否重叠
         */
        _isTimeOverlap: function(startDatetime1, endDatetime1, startDatetime2, endDatetime2) {
            if (startDatetime1 && startDatetime1.getTime() > startDatetime2.getTime() && startDatetime1.getTime() < endDatetime2.getTime()) {
                return true;
            }
            if (endDatetime1 && endDatetime1.getTime() > startDatetime2.getTime() && endDatetime1.getTime() < endDatetime2.getTime()){
                return true;
            }
            return false;
        },
        onDragBegin: function(e) {
            this.childrenPanel.foreach(function(panel){
                panel.onDragBegin(e);
            });
        },
        onDragging: function(e) {
            this.childrenPanel.foreach(function(panel){
                panel.onDragging(e, false, true);
            });
        },
        onDragEnd: function(e) {
            this.childrenPanel.foreach(function(panel){
                panel.onDragEnd(e);
            });
        }
    }); // StoryPanel

    var zindex = 100000;
    var StoryWidgetPanel = Panel.extend({
        /**
         * init
         * @param  {object} timelineInfo timeline's {startMoment:xxxx, endMoment:xxx, left:xx, right:xxx}
         * @return {void}
         */
        init: function(id, panel, container, clientInfo, options, story, timelineInfo) {
            this.story = story;
            this.timelineInfo = timelineInfo;
            this._super(id, panel, container, clientInfo, options);
        },
        create: function() {
            this._super();
            this.client.css('z-index', zindex--);
            var clientInfo = this.clientInfo;
            var options = this.options;
            var story = this.story;
            var timelineInfo = this.timelineInfo;
            // draw flag roll
            this.createRect({
                left: 0,
                top: 2 * options.flagTop.ballRadius,
                width: 1,
                height: clientInfo.height - 2 * options.flagTop.ballRadius + options.flagTop.bulgeLength
            }, options.flagRoll.css, options.flagRoll.clazz);

            // draw flag ball
            this.createCircle({
                x: 1,
                y: 0 + options.flagTop.ballRadius,
                r: options.flagTop.ballRadius
            }, options.flagTop.ballCss, options.flagTop.clazz);

            // draw flag face
            var flag = this.createRect({
                left: 0,
                top: options.flagTop.bulgeLength + 2 * options.flagTop.ballRadius,
                width: options.flag.width,
                height: options.flag.height
            }, options.flag.css, options.flag.clazz);

            // draw flag content
            flag.append(flagStoryTemplate);
            flag.find('.tl-story-flag-title').text(story.title);
            flag.find('.tl-story-flag-timestamp').text(moment(story.startDatetime).format('YYYY.MM.DD'));

            //draw flag tail
            this.createRect({
                left: options.flag.width - options.flag.tailWidth,
                top: options.flagTop.bulgeLength + 2 * options.flagTop.ballRadius,
                width: 0,
                height: 0
            }, {
                'border-top': options.flag.height / 2 + 'px solid transparent',
                'border-bottom': options.flag.height/ 2 + 'px solid transparent',
                'border-right': options.flag.tailWidth + 'px solid'
            }, options.flag.tailClazz);
            // draw event box
            var box = this.createRect({
                left: options.flag.width,
                top: options.flagTop.bulgeLength + 2 * options.flagTop.ballRadius,
                width: clientInfo.width - options.flag.width,
                height: options.flag.height
            }, options.eventBox.css, options.eventBox.clazz);

            // draw box content
            for (var i=0; i<story.events.length; i++) {
                var e = story.events[i];
                var ele  = $(flagStoryEventTemplate);
                box.append(ele);
                var startDatetime = new Date(e.startDatetime);
                var eleLeft = getXByDate(timelineInfo.startMoment, timelineInfo.endMoment, timelineInfo.left, timelineInfo.right, startDatetime);
                eleLeft = eleLeft - clientInfo.left - options.flag.width;
                var eventClientInfo = {
                    left: Math.max(0, eleLeft) + options.eventBox.margin,
                    top: 0 + options.eventBox.margin,
                    width: options.eventBox.perEventWidth - options.eventBox.margin * 2,
                    height: options.flag.height - options.eventBox.margin * 2
                };
                ele.css($.extend({}, eventClientInfo, {'position': 'absolute'}));
                ele.find('.tl-story-flag-event-content').text(e.content);
                ele.find('.tl-story-flag-event-image').attr('src', e.image);
            }
        }
    }); // end StoryWidgetPanel

    var flagStoryTemplate =
        '<div class="tl-story-flag-separator"></div>' +
        '<div class="tl-story-flag-title" >' +
        '</div>' +
        '<div class="tl-story-flag-timestamp" >' +
        '</div>';

    var flagStoryEventTemplate =
        '<div class="tl-story-flag-event">' +
        '<img src="" class="tl-story-flag-event-image">' +
        '<div class="tl-story-flag-event-content">' +
        '</div>';
    // Runs during compile
    return {
        // name: 'timeline',
        priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope, $document) {
            $scope.loadStory = function(startMoment, endMoment) {
                return [{
                    id: '1',
                    startDatetime: '2016-03-19',
                    endDatetime: '2016-03-20',
                    title: '桂林三日游',
                    events: [{
                        id: '1',
                        startDatetime: '2016-03-16',
                        endDatetime: '2016-03-17',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }, {
                        id: '2',
                        startDatetime: '2016-03-17',
                        endDatetime: '2016-03-18',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }]
                },
                {
                    id: '2',
                    startDatetime: '2016-03-19 14:00',
                    endDatetime: '2016-03-20 02:00',
                    title: '桂林三日游桂林三日游桂林三日游桂林三日游',
                    events: [{
                        id: '1',
                        startDatetime: '2016-03-18',
                        endDatetime: '2016-03-18',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安安安安东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }, {
                        id: '2',
                        startDatetime: '2016-03-19',
                        endDatetime: '2016-03-20',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }]
                },
                {
                    id: '2',
                    startDatetime: '2016-03-17 14:00',
                    endDatetime: '2016-03-20 02:00',
                    title: '桂林三日游桂林三日游桂林三日游桂林三日游',
                    events: [{
                        id: '1',
                        startDatetime: '2016-03-18',
                        endDatetime: '2016-03-18',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安安安安东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }, {
                        id: '2',
                        startDatetime: '2016-03-19',
                        endDatetime: '2016-03-20',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        content: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }]
                }
                ];
            };
        },
        require: '?ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        template: '',
        // templateUrl: '',
        replace: false,
        // transclude: true,
        link: function($scope, iElm, iAttrs, ngModel) {
            var hisPanel = new HisPanel(
                'history',
                $(iElm.context),
                $.extend(true, {}, {
                    handlers: {
                        loadStory: $scope.loadStory
                    }
                }, options.hisPanel)
            );
            // hisPanel.destory();
        }
    };
});
