'use strict';
var timeline = {};

/**
 * 时间线的配置
 */
timeline.options = {
	data: {
	},
	// 设置大小
	width: '100%',
	height: '300px',
	xAxisHeight: 40, // x时间轴的高度
	// x时间轴配置
	xAxis: {
        lineAttr: {
            stroke: '#999',
            'stroke-width': 2
        },
        maxDatetime: '2016-01-01',
        minDatetime: '2000-01-01',
		currentDatetime: null, // 现在时间, null 代表现在
		// 刻度
		scale: {
			timeUnitPx: 20, // 最小的刻度像素
			timeUnitSpan: 'hours', // 最小刻度的时间跨度
			timeUnitVLinePx: 10 // 刻度竖线长度
		},
		// 字体颜色和大小
		fontAttr: {
            'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
            'font-size'  : 11,
            fill       : '#999'
        }
	},
	quadrant: {

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
	this.add = function (data) {
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
}
/**
 * 画出时间线组件
 * @param  {element} container
 * @return {void}
 */
timeline.draw = function(container, options) {
    var snap = new Snap(container);
    /**
     * 绘画面板
     * @param {snap} snap svn的容器
     */
    function Panel(snap, options) {
    	this.onInit = function(rect) {
		    // 绘画区域
		    this.clientInfo = rect;
		    this.xAxisGroup = new XAxisGroup(snap, this, options.xAxis);
		    this.guadrantGroup = new LinkedList();
		    // 初始化x轴
		    var xAxisRect = {
		    	x: 0, y: rect.cy - options.xAxisHeight, cx: rect.cx, cy: rect.cy
		    };
		    this.xAxisGroup.onInit(xAxisRect);
    	};

    	// 绘画
    	this.draw = function() {
    		this.xAxisGroup.draw();
    	};

    	this.afterDrawXAxis = function(xClientInfo, startMoment, endMoment, offset) {
    		var guadrant = new Guadrant(snap, this, options.guadrant);
    		var guadrantRect = {
    			x: 0, y: 0, cx: xClientInfo.cx, cy: xClientInfo.y
    		};
    		guadrant.offset = offset;
    		guadrant.onInit(guadrantRect);
    		guadrant.draw();
    	};

    	this.afterXAxisDestory = function(xClientInfo, startMoment, endMoment, offset) {
    		console.log(arguments);
    	};
    }

    function Guadrant(snap, panel, options) {
    	var helpRectTempl = 'M {ox},{oy} h {width} v {height} h -{width} z';
    	var group = snap.group();
    	this.group = group;
    	this.onInit = function(rect) {
    		this.clientInfo = rect;
    		// 画一个rectangle，用于方便拖动
    		var rectEle = snap.path(Snap.format(helpRectTempl, {
    			ox:rect.x, oy:rect.y, width: rect.cx - rect.x, height: rect.cy - rect.y
    		}));
    		// 这个help rect透明
    		rectEle.attr({fill: 'rgba(249, 249, 249, .0)'});
    		// 设置竖线
    		rectEle.mousemove(function(e, x, y) {
    			console.log(arguments);
    		});
    		group.add(rectEle);
    	};
    	this.draw = function() {

    	};
    }
    /**
     * x轴由一组XAxis组成
     *
     * @param {snap]} snap
     * @param {object} options timeline.xAxis
     */
    function XAxisGroup(snap, panel, options) {
    	var xAxisArr = new LinkedList();
    	// current axis group's matrix
    	this._matrix = Snap.matrix();
    	// 一屏总共的竖线个数
    	this._spanCount = 0;
    	// offset为1结束时间
		this._currentDatetime = new Date();
		var _this = this;
		if (options.currentDatetime) {
			this._currentDatetime = new Date(options.currentDatetime);
		}
		if (options.maxDatetime) {
			this._maxDatetime = new Date(options.maxDatetime);
		}
		if (this._maxDatetime && this._maxDatetime.getTime() < this._currentDatetime.getTime()) {
			this._maxDatetime = this._currentDatetime;
		}
		if (options.minDatetime) {
			this._minDatetime = new Date(options.minDatetime);
		}
		if (this._minDatetime && this._minDatetime.getTime() > this._currentDatetime.getTime()) {
			this._minDatetime = this._currentDatetime;
		}

    	this.onInit = function(rect) {
    		this.clientInfo = rect;
    		// 当前的时刻在x轴的位置, 一屏的宽度不是clientInfo.cx - clientInfo.x, 而是_spanCount * timeUnitPx
    		this._currentX = (rect.cx - rect.x) / 2;
  			this._spanCount = parseInt((rect.cx - rect.x) / options.scale.timeUnitPx);

  			// 循环三次，做三个x轴
    		for (var i=0;i<2;i++) {
    			this._initXAxis(i);
    		}
    	};

    	this._initXAxis = function(offset) {
			var currentMoment = moment(this._currentDatetime);
			var endMoment = currentMoment.clone().add(offset * this._spanCount, options.scale.timeUnitSpan);
			var startMoment = endMoment.clone().add(-this._spanCount, options.scale.timeUnitSpan);
			var xAxis = new XAxis(snap, panel, options, startMoment, endMoment);
			// 每一段坐标轴的宽度
			var oneXLength = this._spanCount * options.scale.timeUnitPx;
			var rectOne = {
				x: this._currentX + oneXLength * (offset - 1),
				y: this.clientInfo.y,
				cx: this._currentX + oneXLength * (offset),
				cy: this.clientInfo.cy
			};
			xAxis.onInit(rectOne);
			xAxis.group.drag(_onDrag, null, _onDragEnd);
			xAxis.offset = offset;
			if (!xAxisArr.first() || offset > xAxisArr.first().offset) {
				xAxisArr.add(xAxis);
			} else if (offset < xAxisArr.last().offset) {
				xAxisArr.addLast(xAxis);
			} else {
				console.log('add xaxis error, offset number error');
			}
			return xAxis;
    	};

    	/*********************** 拖动x 的处理*************************/
    	this.draw = function() {
    		xAxisArr.foreach(function(xAxis){
    			xAxis.draw();
    		});
    	};

    	function _onDrag(dx, dy, x, y, obj) {
			var currentMatrix = _this._matrix.split();
			_this._draggingMatrix = Snap.matrix().translate(currentMatrix.dx + dx, currentMatrix.dy);
			var draggingClinetInfo = null;
			if (dx < 0) {
				draggingClinetInfo = xAxisArr.first().clientInfo;
    			if (draggingClinetInfo.x + _this._draggingMatrix.split().dx <= 0) {
    				_this._draggingMatrix = Snap.matrix().translate(-draggingClinetInfo.x, currentMatrix.dy);
    			}
    			_this._draggingDirection = 'left';
			} else if (dx > 0) {
				draggingClinetInfo = xAxisArr.last().clientInfo;
				if (draggingClinetInfo.x + _this._draggingMatrix.split().dx >= 0) {
    				_this._draggingMatrix = Snap.matrix().translate(-draggingClinetInfo.x, currentMatrix.dy);
				}
    			_this._draggingDirection = 'right';
			}
    		xAxisArr.foreach(function(xAxis){
    			xAxis.group.transform(_this._draggingMatrix.toTransformString());
    		});
    	}

    	function _onDragEnd() {
    		// 赋值回去
			if (_this._draggingMatrix) {
				_this._matrix = _this._draggingMatrix;
			}

			var endMatrix = _this._matrix.split();
			console.log(_this._draggingDirection);
			// 向左拖住啊x
			if (_this._draggingDirection === 'left') {
				var firstAxis = xAxisArr.first();
				if (endMatrix.dx + firstAxis.clientInfo.x < options.scale.timeUnitPx) {
					// 开始生成并读取右边的坐标轴和数据
					_this._initXAxis(firstAxis.offset + 1).draw().group.transform(_this._draggingMatrix.toTransformString());
					// 开始删除左边坐标轴
					if (xAxisArr.first().offset - xAxisArr.last().offset > 3) {
						xAxisArr.removeLast().destory();
					}
				}
			}
			// 向右
			else if (_this._draggingDirection === 'right') {
				var lastAxis = xAxisArr.last();

				if (lastAxis.clientInfo.x + endMatrix.dx > -options.scale.timeUnitPx) {
					// 开始生成读取左边的数据
					_this._initXAxis(lastAxis.offset - 1).draw().group.transform(_this._draggingMatrix.toTransformString());
					// 删除右边的坐标轴
					if (xAxisArr.first().offset - xAxisArr.last().offset > 3) {
						xAxisArr.removeFirst().destory();
					}
				}
			}
    	}

    	/*********************** 拖动x 的处理*************************/
    }
    /**
     * x轴
     */
    function XAxis(snap, panel, options, startMoment, endMoment) {
    	// 刻度
    	var scales = [];
    	var group = snap.group();
    	this.group = group;
    	this.clientInfo = null;

    	var helpRectTempl = 'M {ox},{oy} h {width} v {height} h -{width} z';
    	this.onInit = function(rect) {
    		this.clientInfo = rect;
    		// 画一个rectangle，用于方便拖动
    		var rectEle = snap.path(Snap.format(helpRectTempl, {
    			ox:rect.x, oy:rect.y, width: rect.cx - rect.x, height: rect.cy - rect.y
    		}));
    		// 这个help rect透明
    		rectEle.attr({fill: 'rgba(249, 249, 249, .0)', cursor: 'pointer'});
    		group.add(rectEle);
    	};

    	/**
    	 * 绘制时间轴
    	 */
    	this.draw = function() {
    		// 画线
            var line = snap.line(this.clientInfo.x, this.clientInfo.y, this.clientInfo.cx, this.clientInfo.y);
            line.attr(options.lineAttr);
            group.add(line);

            // 画刻度
            this._drawScales();
            panel.afterDrawXAxis(this.clientInfo, startMoment, endMoment, this.offset);
            return this;
    	};

    	this.destory = function() {
    		this.group.remove();
            panel.afterXAxisDestory(this.clientInfo, startMoment, endMoment, this.offset);
    	};

    	/**
    	 * 画刻度
    	 * @return
    	 */
    	this._drawScales = function() {
    		for (var i=this.clientInfo.x; i<this.clientInfo.cx; i+=options.scale.timeUnitPx) {
    			var scaleRect = {
    				x: i, y: this.clientInfo.y, cx: i, cy: this.clientInfo.y + options.scale.timeUnitVLinePx
    			};
    			var line = snap.line(scaleRect.x, scaleRect.y, scaleRect.cx, scaleRect.cy);
    			line.attr(options.lineAttr);
    			group.add(line);
    			// 把刻度加入数组
    			var index = (i - this.clientInfo.x) / options.scale.timeUnitPx;
    			var scale = {
    				i: index,
    				rect: scaleRect,
    				ele: line,
    				moment: startMoment.clone().add(index, options.scale.timeUnitSpan)
    			};
    			scales.push(scale);

    			this._afterDrawScale(scale);
    		}
    	};

    	/**
    	 * 画了刻度后
    	 * @param  {刻度} scale {rect, objLine}
    	 * @return {void}
    	 */
    	this._afterDrawScale = function(scale) {
    		// 按照月的精度画文字
    		if (options.scale.timeUnitSpan === 'months') {
    			// 如果要画文字
    			if (scale.moment.month() === 0) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('YYYY.MM'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    		else if (options.scale.timeUnitSpan === 'weeks') {
    			if (scale.moment.week() % 10 === 0) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('MM.DD'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    		else if (options.scale.timeUnitSpan === 'hours') {
    			if (scale.moment.hour() === 0) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('MM.DD'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    		// 按照天的精度
    		else if (options.scale.timeUnitSpan === 'days') {
    			if (scale.moment.date() === 1 || scale.moment.date() ===15) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('MM.DD'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    		// 精度为年
    		else if (options.scale.timeUnitSpan === 'years') {
    			if (scale.moment.year() % 10 === 0 ) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('YYYY年'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    	};
    }

    var newOptions = $.extend(true, {}, timeline.options, options);
    var panel = new Panel(snap, newOptions);
    container = $(container);
    // 设置宽高
    container.css('width', newOptions.width);
    container.css('height', newOptions.height);
    var rect = {
    	x: 0, y: 0, cx: container.innerWidth(), cy: container.innerHeight()
    };

    panel.onInit(rect);
    panel.draw();
};

/**
 * rect 减去 padding的内空
 * @param  {rect} 			rect    矩形 {x, y, cx, cy}
 * @param  {padding} 		padding 边距 {left, right, top, bottom}
 * @return {rect}         	矩形
 */
timeline.clipRect = function(rect, padding) {
	return {
		x: rect.x + padding.left,
		y: rect.y - padding.top,
		cx: rect.cx -  padding.right,
		cy: rect.cy - padding.bottom
	};
};

tlApp.directive('timeline', function(){
	// Runs during compile
	return {
		// name: 'timeline',
		priority: 1,
		// terminal: true,
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope) {
		},
		require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
		template: '',
		// templateUrl: '',
		replace: false,
		// transclude: true,
		link: function($scope, iElm, iAttrs, ngModel) {
			console.log(iElm);
			console.log(iAttrs);
			timeline.draw(iElm.context);
		}
	};
});