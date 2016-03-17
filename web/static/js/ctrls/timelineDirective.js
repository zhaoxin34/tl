'use strict';

tlApp.directive('timeline', function() {
    var options = {
        handlers: {
            laodStory: null, // 设置读取故事的处理器
        },
        hisPanel: {
            height: 300,
            maxDatetime: '2016-01-01',
            minDatetime: '2000-01-01',
            currentDatetime: null, // 现在时间, null 代表现在
            css: {
                // 设置大小
                width: '100%',
                height: '300px',
                'background-color': '#aaa'
            },

            /** @type {options} timeline options */
            timelineOptions: {
                height:50,
                css: {
                    'background-color': '#dda',
                    // 字体颜色和大小
                    'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                    'font-size': 11,
                    overflow: 'hidden',
                    color: '#999',
                    cursor: 'move'
                },
                timelineSliceOptions: {
                    // 刻度
                    timeUnitPx: 20, // 最小的刻度像素
                    timeUnitSpan: 'hours', // 最小刻度的时间跨度
                    timeUnitVLineWidthPx: 2, // 刻度竖线宽度
                    timeUnitVLineHeightPx: 10, // 刻度竖线高度
                    timeUnitCss: {
                        'background-color': '#aaa'
                    },
                    css: {

                    }
                }
            },
            /** @type {options} story options */
            storyOptions: {
                height: 240,
                css: {
                    'background-color': '#dee',
                    'overflow': 'hidden'
                },
                storyWidgetOptions: {
                    css: {
                        border: '1px solid #f00'
                    },
                    // 旗杆
                    flagRoll: {
                        minLength: 20,
                        css: {
                            'background-color': '#f00'
                        }
                    },
                    // 旗
                    flag: {
                        width: 200,
                        height: 80,
                        css: {
                            border: '1px solid #ff0'
                        }
                    },
                    flagTop: {
                        bulgeLength: 10,
                        bulgeCss:{
                            'background-color': '#f0f'
                        },
                        ballRadius: 10,
                        ballCss: {
                            'border': '1px solid #000',
                            'border-radius': '50%'
                        }
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
        onDragging: function(e) {
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
            this.client.remove();
            this.childrenPanel.foreach(function(panel){
                panel.destory();
            });
        },
        createRect: function(rect, css) {
            var rectEle = $('<div></div>');
            if (css) {
                rectEle.css(css);
            }
            rectEle.css($.extend({}, rect, {position:'absolute'}));
            this.client.append(rectEle);
            return rectEle;
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
        },
        onLoadTimeline: function(startMoment, endMoment, left, right){
            var storyList = this.loadStoryCallback(startMoment, endMoment);
            this.storyPanel.loadStory(startMoment, endMoment, left, right, storyList);
        },
        onUnloadTimeline: function(startMoment, endMoment, left, right){
            console.log(arguments);
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
        },
        onDragging: function(e) {
            var dx = e.clientX - this.dragBeginPostion.clientX;
            this.offsetDx = this.beginOffsetDx + dx;
            this.timelineSliceList.foreach(function(panel){
                panel.moveTo(panel.dragBeginPostion.left + dx, panel.dragBeginPostion.top);
            });
            if (dx < 0){this.dragEndDirection = 'left'; }
            else if (dx >0){this.dragEndDirection = 'right'; }
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
                var rectEle = this.createRect(scaleRect, options.timeUnitCss);
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

    var StoryPanel = Panel.extend({
        loadStory: function(startMoment, endMoment, left, right, storyList) {
            function getXByDate(date) {
                var per = (right -left) / (endMoment.toDate().getTime() - startMoment.toDate().getTime());
                var dateSpan = date.getTime() - startMoment.toDate().getTime();
                return parseInt(left + dateSpan * per);
            }
            var clientInfo = this.clientInfo;
            var options = this.options;
            var storyVCount = parseInt(clientInfo.height / (options.storyWidgetOptions.flag.height + options.storyWidgetOptions.flagRoll.minLength));
            var oneFloorHeight = parseInt(clientInfo.height / storyVCount);
            var story2Arr = [];// 二维数组，第一维是层，第二维是storyWidget的clientInfo
            for (var i=0; i< storyList.length; i++) {
                var story = storyList[i];
                // console.log(story);
                if (story.startDatetime) {
                    story.startDatetime = new Date(story.startDatetime);
                }
                if (story.endDatetime) {
                    story.endDatetime = new Date(story.endDatetime);
                }
                var storyLeft = getXByDate(story.startDatetime);
                var storyRight = storyLeft + options.storyWidgetOptions.flag.width;
                if (story.endDatetime) {
                    storyRight = Math.max(getXByDate(story.endDatetime), storyRight);
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
                    width: storyRight - storyLeft,
                    height: flagWidgetHeight
                };
                if (!(floor in story2Arr)) {
                    story2Arr[floor] = [];
                }
                story2Arr[floor].push(flagWidgetClientInfo);
                console.log(story2Arr);
                this.addChildPanel(new StoryWidgetPanel('story_widget_' + story.id, this, this.client, flagWidgetClientInfo, options.storyWidgetOptions, story));
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
        }
    }); // StoryPanel

    var StoryWidgetPanel = Panel.extend({
        init: function(id, panel, container, clientInfo, options, story) {
            this._super(id, panel, container, clientInfo, options);
            this.story = story;
        }
    });
    // Runs during compile
    return {
        // name: 'timeline',
        priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope) {
            $scope.loadStory = function(startMoment, endMoment) {
                return [{
                    id: '1',
                    startDatetime: '2016-03-16',
                    endDatetime: '2016-03-20',
                    title: '桂林三日游',
                    event: [{
                        id: '1',
                        startDatetime: '2016-03-16',
                        endDatetime: '2016-03-16',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        title: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }, {
                        id: '2',
                        startDatetime: '2016-03-17',
                        endDatetime: '2016-03-17',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        title: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }]
                },
                {
                    id: '2',
                    startDatetime: '2016-03-16',
                    endDatetime: '2016-03-20',
                    title: '桂林三日游',
                    event: [{
                        id: '1',
                        startDatetime: '2016-03-16',
                        endDatetime: '2016-03-16',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        title: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }, {
                        id: '2',
                        startDatetime: '2016-03-17',
                        endDatetime: '2016-03-17',
                        image: 'http://localhost:8888/static/img/ace/user.jpg',
                        title: '安东尼奥，真的，我不知道我为什么这样闷闷不乐'
                    }]
                }
                ];
            };
        },
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
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
