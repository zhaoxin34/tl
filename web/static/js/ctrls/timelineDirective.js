'use strict';

tlApp.directive('timeline', function() {
    var options = {
        data: {},
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
                    color: '#999'
                },
                timelineSliceOptions: {
                    // 刻度
                    timeUnitPx: 20, // 最小的刻度像素
                    timeUnitSpan: 'years', // 最小刻度的时间跨度
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
                    'background-color': '#dee'
                }
            }
        },
        // x时间轴配置
        xAxis: {
        },
        quadrant: {
            rect: {
                fill: 'rgba(200, 200, 200, 1)',
                stroke: '#999',
                'stroke-width': 2
            }
        }
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
        }
    });

    var HisPanel = Panel.extend({
        init: function(id, container, options) {
            var clientInfo = {
                left: 0, top: 0, width: container.innerWidth(), height: container.innerHeight()
            };
            clientInfo.height = options.height? options.height : clientInfo.height;
            clientInfo.width = options.width? options.width : clientInfo.width;
            this._super(id, null, container, clientInfo, options);

            var timelineOptions = options.timelineOptions;
            var timelineClientInfo = {
                left: clientInfo.left,
                top: clientInfo.height - timelineOptions.height,
                width: clientInfo.width,
                height: timelineOptions.height
            };
            var timelinePanel = new TimelinePanel('timeline', this, this.client, timelineClientInfo, timelineOptions);

            var storyOptions = options.storyOptions;
            var storyClientInfo = {
                left: clientInfo.left,
                top: clientInfo.top,
                width: clientInfo.width,
                height: storyOptions.height
            };
            var storyPanel = new StoryPanel('story', this, this.client, storyClientInfo, storyOptions);
            this.addChildPanel(timelinePanel);
            this.addChildPanel(storyPanel);

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
    });

    var TimelinePanel = Panel.extend({
        create: function() {
            this._super();

            this.createTimelineSlice();
        },
        createTimelineSlice: function() {
            this.timelineSliceList = new LinkedList();
            // 循环三次，做三个x轴
            for (var i=0;i<2;i++) {
                this.createOneTimelineSlice(i);
            }
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
                left: -0.5 * oneXLength + oneXLength * offset,
                top: 0,
                width: clientInfo.width,
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

    });
    // Runs during compile
    return {
        // name: 'timeline',
        priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope) {},
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
                $.extend(true, {},
                    {
                        data: {
                            storyList: [{
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
                            }]
                        }
                    }, options.hisPanel)
            );
            // hisPanel.destory();
        }
    };
});
