'use strict';

tlApp.directive('timeline', function($compile) {
    var options = {
        handlers: {
            laodStory: null, // 设置读取故事的处理器
        },
        hisPanel: {
            maxDatetime: '2016-01-01',
            minDatetime: '2000-01-01',
            currentDatetime: '2016-03-16', // 现在时间, null 代表现在
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
                width: 80,
                css: {
                    overflow: 'hidden',
                    cursor: 'move'
                },
                clazz: 'tl-timeline',
                timelineSliceOptions: {
                    // 刻度
                    timeUnitPx: 20, // 最小的刻度像素
                    timeUnitSpan: 'hours', // 最小刻度的时间跨度
                    timeUnitVLineWidthPx: 10, // 刻度竖线宽度
                    timeUnitVLineHeightPx: 2, // 刻度竖线高度
                    timeUnitCss: {
                    },
                    timeUnitClazz: 'tl-timeline-unit',
                    css: {

                    }
                }
            },
            /** @type {options} story options */
            storyOptions: {
                css: {
                    'overflow': 'hidden'
                },
                clazz: 'tl-story',
                storyWidgetOptions: {
	                minWidth: 190,
	                marginLeft: 10,
	                marginRight: 10,
	                paddingLeft: 10,
	                paddingRight: 10,
	                css: {
                    	border: '1px solid #fff'
                    },
                    head: {
                    	radius: 20,
	                    marginLeft: 30,
	                    clazz: 'tl-story-widget-head'
                    },
                    neck: {
                    	width: 6,
                    	clazz: 'tl-story-widget-neck'
                    },
                    arm: {
                    	height: 6,
                    	marginLeft: 10,
                    	clazz: 'tl-story-widget-arm'
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
            this.fatherPanel = panel;
            this.clientInfo = $(clientInfo);
            this.options = options;
            this.clientInfo = clientInfo;
            this.container = container;
            this.childrenPanel = new LinkedList();
            this.eventQueue = new LinkedList();
            /**
             * 面板是否已经准备好了
             * 准备好了才可以：1 响应事件, 2
             * @type {Boolean}
             */
            this.isReady = false;
            this.id = id;
            if (panel == null) {
                container.css({'position': 'relative'});
            }
            this.create();
            this.isReady = true;
            this.afterCreate();
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
            this.isReady = false;
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
            console.log('fireFatherEvent ' + eventName);
            if (this.fatherPanel) {
            	if (this.fatherPanel.isReady) {
	                this.fatherPanel[eventName].apply(this.fatherPanel, args);
            	} else {
            		this.fatherPanel.eventQueue.addLast({
            			eventName: eventName,
            			args: args
            		});
            	}
            }
        },
        fireGrandpaEvent: function(eventName, args) {
            console.log('fireGrandpaEvent ' + eventName);
            if (this.fatherPanel && this.fatherPanel.fatherPanel) {
            	if (this.fatherPanel.fatherPanel.isReady) {
	                this.fatherPanel.fatherPanel[eventName].apply(this.fatherPanel.fatherPanel, args);
            	} else {
            		this.fatherPanel.fatherPanel.eventQueue.addLast({
            			eventName: eventName,
            			args: args
            		});
            	}
            }
        },
        afterCreate: function() {
        	var event = this.eventQueue.removeFirst();
        	while(event) {
        		this[event.eventName].apply(this, event.args);
        		event = this.eventQueue.removeFirst();
        	}
        },
        reCreate: function() {
            this.destory();
            this.create();
            this.isReady = true;
            this.afterCreate();
        }
    });

	var HisPanel = Panel.extend({
        init: function(id, container, options) {
            var clientInfo = {
                left: 0, top: 0, width: container.innerWidth(), height: container.innerHeight()
            };
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
            if (options.minDatetime) {
                this.minDatetime = new Date(options.minDatetime);
            }
            // if (this.minDatetime && this.minDatetime.getTime() > this.currentDatetime.getTime()) {
            //     this.currentDatetime = this.minDatetime;
            // }

            var timelineOptions = options.timelineOptions;
            var timelineClientInfo = {
                left: clientInfo.left,
                top: clientInfo.top,
                width: timelineOptions.width,
                height: clientInfo.height
            };

            var storyOptions = options.storyOptions;
            var storyClientInfo = {
                left: clientInfo.left + timelineOptions.width,
                top: clientInfo.top,
                width: clientInfo.width - timelineOptions.width,
                height: clientInfo.height
            };

            var storyPanel = new StoryPanel('story', this, this.client, storyClientInfo, storyOptions);
            this.addChildPanel(storyPanel);
            this.storyPanel = storyPanel;

            var timelinePanel = new TimelinePanel('timeline', this, this.client, timelineClientInfo, timelineOptions, this.currentDatetime);
            this.addChildPanel(timelinePanel);
            this.timelinePanel = timelinePanel;

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
        onLoadTimeline: function(startMoment, endMoment){
            var storyList = this.loadStoryCallback(startMoment, endMoment);
            this.storyPanel.loadStory(startMoment, endMoment, storyList);
        },
        onUnloadTimeline: function(startMoment, endMoment){
            console.log('unUnloadTimeline');
        },
        onTimelineDragging: function(e) {
            // this.storyPanel.onDragging(e);
        },
        onTimelineDragBegin: function(e) {
            // this.storyPanel.onDragBegin(e);
        },
        onTimelineDragEnd: function(e) {
            // this.storyPanel.onDragEnd(e);
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
            this.reCreate();
        },
        queryYPosByDate: function(date) {
        	return this.timelinePanel.queryYPosByDate(date);
        }
    });
	var timeSpanMap = {
		'hours': 60 * 60,
		'days': 60 * 60 * 24,
		'weeks': 60 * 60 *24 * 7,
		'months': 60 * 60 * 24 * 30,
		'years': 68 * 60 * 24 * 365
	};
	var TimelinePanel = Panel.extend({
        init: function(id, panel, container, clientInfo, options, currentDatetime) {
	        this.currentMoment = moment(currentDatetime);
        	this._super(id, panel, container, clientInfo, options);
		},
	    create: function() {
	        this._super();
	        this.offsetDx = 0;
   	        var clientInfo = this.clientInfo;
	        var options = this.options;
	        // 一屏总共的竖线个数
	        this.spanCount = parseInt(clientInfo.height / options.timelineSliceOptions.timeUnitPx);
	        // 每一段坐标轴的宽度
	        this.oneYLength = this.spanCount * options.timelineSliceOptions.timeUnitPx;

	        this.createTimelineSlice();
	    },
	    createTimelineSlice: function() {
	        this.timelineSliceList = new LinkedList();
	        // 循环三次，做三个x轴
	        for (var i=0;i<2;i++) {
	            this.createOneTimelineSlice(i);
	        }
	        this.drag();
	    },
	    createOneTimelineSlice: function(offset) {
	        var clientInfo = this.clientInfo;
	        var options = this.options;
	        var oneYLength = this.oneYLength;
	        var spanCount = this.spanCount;

	        var currentMoment = this.currentMoment;
	        if (['weeks', 'years', 'hours', 'days', 'months'].indexOf(options.timelineSliceOptions.timeUnitSpan) >= 0) {
	            currentMoment.hour(0);
	            currentMoment.minute(0);
	            currentMoment.second(0);
	            currentMoment.millisecond(0);
	        }
	        var endMoment = currentMoment.clone().add(-(offset-1) * spanCount, options.timelineSliceOptions.timeUnitSpan);
	        var startMoment = endMoment.clone().add(-spanCount, options.timelineSliceOptions.timeUnitSpan);

	        var oneClientInfo = {
	            left: 0,
	            top: -0.5 * oneYLength + oneYLength * offset + this.offsetDx,
	            width: clientInfo.width,
	            height: spanCount * options.timelineSliceOptions.timeUnitPx,
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
	        if ('up' === this.dragEndDirection) {
	            var first = this.timelineSliceList.first();
	            var last = this.timelineSliceList.last();
	            if (first.clientInfo.top <= this.clientInfo.height) {
	                // 开始生成并读取右边的坐标轴和数据
	                var timelineSlice = this.createOneTimelineSlice(first.offset + 1);
	                // 开始删除左边坐标轴
	                if (Math.abs(first.offset - last.offset) > 4) {
	                    this.timelineSliceList.removeLast().destory();
	                }
	            }
	        }
	        // 向右
	        else if ('down' === this.dragEndDirection) {
	            var first = this.timelineSliceList.first();
	            var last = this.timelineSliceList.last();
	            if (last.clientInfo.top >= -this.clientInfo.height) {
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
	        var dx = e.clientY - this.dragBeginPostion.clientY;
	        this.offsetDx = this.beginOffsetDx + dx;
	        this.timelineSliceList.foreach(function(panel){
	            panel.moveTo(panel.dragBeginPostion.left, panel.dragBeginPostion.top + dx);
	        });
	        if (dx < 0){this.dragEndDirection = 'up'; }
	        else if (dx >0){this.dragEndDirection = 'down'; }
	        else { this.dragEndDirection = ''; }
	        this.fireFatherEvent('onTimelineDragging', [e]);
	    },
	    queryYPosByDate: function(date) {
	    	var options = this.options;
			var timeSpan = (-date.getTime() + this.currentMoment.toDate().getTime()) /1000;
			var pxSpan = options.timelineSliceOptions.timeUnitPx * parseInt(timeSpan / timeSpanMap[options.timelineSliceOptions.timeUnitSpan]);
			pxSpan = pxSpan + this.oneYLength * 0.5 + this.offsetDx;
			return pxSpan;
	    },
	    queryDateByYPos: function(y) {

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
            this.fireGrandpaEvent('onLoadTimeline', [this.startMoment, this.endMoment]);
        },
        destory: function() {
            this._super();
            this.fireGrandpaEvent('onUnloadTimeline', [this.startMoment, this.endMoment]);
        },
        _createScales: function() {
            var clientInfo = this.clientInfo;
            var options = this.options;
            for (var i=0; i<clientInfo.height / options.timeUnitPx; i++) {
                var scaleRect = {
                    left: 0,
                    top: i * options.timeUnitPx,
                    width: options.timeUnitVLineWidthPx,
                    height:options.timeUnitVLineHeightPx
                };
                var rectEle = this.createRect(scaleRect, options.timeUnitCss, options.timeUnitClazz);
                // 把刻度加入数组
                var scale = {
                    i: i,
                    rect: scaleRect,
                    ele: rectEle,
                    moment: this.endMoment.clone().add(-i, options.timeUnitSpan)
                };
                this._afterDrawScale(scale);
            }
        },
        _afterDrawScale: function(scale) {
            var client = this.client;
            var options = this.options;

            function createText(text) {
                // 将刻度变长
                scale.ele.css({'width': options.timeUnitVLineWidthPx*3});
                // 刻字
                var textEle  = $('<span></spa>');
                textEle.text(text);
                textEle.css({
                    left: scale.rect.left + options.timeUnitVLineWidthPx + 4,
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
    function getXByDate(startMoment, endMoment, left, right, date) {
        var per = (right -left) / (endMoment.toDate().getTime() - startMoment.toDate().getTime());
        var dateSpan = date.getTime() - startMoment.toDate().getTime();
        // console.log(arguments);
        return parseInt(right - dateSpan * per);
    }

    var StoryPanel = Panel.extend({
        loadStory: function(startMoment, endMoment, storyList) {

            for (var i=0; i< storyList.length; i++) {
                var story = storyList[i];
                // storyWidgetPanel.drag();
                var storyWidgetPanel = this._loadOneStory(story, startMoment, endMoment);
                if (storyWidgetPanel) {
                    this.addChildPanel(storyWidgetPanel);
                }
            }
        },
        /**
         * load one story
         * @param  {object} story
         * @return {StoryWidgetPanel}
         */
        _loadOneStory: function(story, startMoment, endMoment) {
            var clientInfo = this.clientInfo;
            var options = this.options;
            var storyWidgetOptions = options.storyWidgetOptions;
            var top = this.fatherPanel.queryYPosByDate(endMoment.toDate());
            var down = this.fatherPanel.queryYPosByDate(startMoment.toDate());

            // 一竖屏可以容纳的故事线数量
            var storyLineCount = parseInt(clientInfo.width / (storyWidgetOptions.minWidth + storyWidgetOptions.marginLeft + storyWidgetOptions.marginRight));
            var oneFloorWidth = parseInt(clientInfo.width / storyLineCount);
            if (!this.story2Arr) {
                this.story2Arr = [];
            }
            var story2Arr = this.story2Arr;// 二维数组，第一维是层，第二维是storyWidget的clientInfo
            if (story.startDatetime) {
                story.startDatetime = new Date(story.startDatetime);
            }
            if (story.endDatetime) {
                story.endDatetime = new Date(story.endDatetime);
            }
            var storyDown = getXByDate(startMoment, endMoment, top, down, story.startDatetime);
            var storyTop = getXByDate(startMoment, endMoment, top, down, story.endDatetime);
            // console.log('storyTop' + storyTop + ', top' + top + ', storyDown' + storyDown + ', down' + down);

            // 不在当前范围
            if (storyTop < top || storyTop >= down){
                return;
            }

            var floor = 0; // 层数
            outer: for (var f=0; f<storyLineCount; f++) {
                if (f in story2Arr) {
                    for (var ff=0; ff< story2Arr[f].length; ff++) {
                        var cl = story2Arr[f][ff];
                        if (!this._isXOverlap(storyTop, storyDown, cl.top, cl.top + cl.height)) {
                            floor = f;
                            break outer;
                        }
                    }
                } else {
                    floor = f;
                    break outer;
                }
            }
            var flagWidgetLeft = (floor) * oneFloorWidth;
            var flagWidgetClientInfo = {
                left: flagWidgetLeft,
                top: storyTop,
                width: oneFloorWidth,
                height: storyDown - storyTop
            };
            if (!(floor in story2Arr)) {
                story2Arr[floor] = [];
            }
            story2Arr[floor].push(flagWidgetClientInfo);
            // console.log(story2Arr);
            var  storyWidgetPanel = new StoryWidgetPanel('story_widget_' + story.id, this, this.client,
                    flagWidgetClientInfo, options.storyWidgetOptions, story,
                    {startMoment: startMoment, endMoment: endMoment, top: top, down: down});
            return storyWidgetPanel;

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
         * @param  {object} timelineInfo timeline's {startMoment:xxxx, endMoment:xxx, top:xx, down:xxx}
         * @return {void}
         */
        init: function(id, panel, container, clientInfo, options, story, timelineInfo) {
            // console.log(clientInfo);
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
        }
    }); // end StoryWidgetPanel

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
                    startDatetime: '2016-03-14',
                    endDatetime: '2016-03-16 00:00',
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
                    startDatetime: '2016-03-15 14:00',
                    endDatetime: '2016-03-16 02:00',
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
                    id: '3',
                    startDatetime: '2016-03-13 14:00',
                    endDatetime: '2016-03-16 02:00',
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