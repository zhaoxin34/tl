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
	xAxisHeight: 200, // x时间轴的高度
	// x时间轴配置
	xAxis: {
        lineAttr: {
            stroke: '#999',
            'stroke-width': 2
        },
		endDatetime: null, // 结束时间, null 代表现在
		// 刻度
		scale: {
			timeUnitPx: 20, // 最小的刻度像素
			timeUnitSpan: 'weeks', // 最小刻度的时间跨度
			timeUnitVLinePx: 10 // 刻度竖线长度
		},
		// 字体颜色和大小
		fontAttr: {
            'font-family': '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
            'font-size'  : 11,
            fill       : '#999'
        }
	}
};
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
		    this.XAxisGroup = new XAxisGroup(snap, options.xAxis);
		    // 初始化x轴
		    var xAxisRect = {
		    	x: 0, y: rect.cy - options.xAxisHeight, cx: rect.cx, cy: rect.cy
		    };
		    this.XAxisGroup.onInit(xAxisRect);
    	};

    	// 绘画
    	this.draw = function() {
    		this.XAxisGroup.draw();
    	};
    }

    /**
     * x轴由一组XAxis组成
     *
     * @param {snap]} snap
     * @param {object} options timeline.xAxis
     */
    function XAxisGroup(snap, options) {
    	var xAxisArr = [];
    	this.onInit = function(rect) {
    		this.clientInfo = rect;
  			var endDatetime = new Date();
  			if (options.endDatetime) {
  				endDatetime = new Date(options.endDatetime);
  			}
  			var spanCount = parseInt((rect.cx - rect.x) / options.scale.timeUnitPx);

  			// 循环三次，做三个x轴
    		for (var i=0;i<3;i++) {
    			var endMoment = moment(endDatetime);
    			endMoment.add((i -1) * spanCount, options.scale.timeUnitSpan);
    			var startMoment = endMoment.clone().add(-spanCount, options.scale.timeUnitSpan);
    			var xAxis = new XAxis(snap, options, startMoment, endMoment);
    			// 每一段坐标轴的宽度
    			var oneXLength = spanCount * options.scale.timeUnitPx;
    			var rectOne = {
    				x: rect.x + oneXLength * (i - 1),
    				y: rect.y,
    				cx: rect.x + oneXLength * (i),
    				cy: rect.cy
    			};
    			xAxis.onInit(rectOne);
    			xAxis.group.drag(_onDrag, null, _onDragEnd);
    			xAxisArr.push(xAxis);
    		}
    	};

    	/*********************** 拖动x 的处理*************************/
    	this.draw = function() {
    		for (var i=0; i<xAxisArr.length; i++) {
    			xAxisArr[i].draw();
    		}
    	};

    	function _onDrag(dx, dy, x, y, obj) {
    		for (var i=0; i<xAxisArr.length; i++) {
    			xAxisArr[i]._draggingX = xAxisArr[i].tx + dx;
	    		xAxisArr[i].group.attr('transform', 'translate(' + (xAxisArr[i]._draggingX) + ' ' + xAxisArr[i].ty  + ')' );
    		}
    	}

    	function _onDragEnd(x, y, obj) {
    		for (var i=0; i<xAxisArr.length; i++) {
    			xAxisArr[i].tx = xAxisArr[i]._draggingX;
    		}
    	}
    	/*********************** 拖动x 的处理*************************/
    }
    /**
     * x轴
     */
    function XAxis(snap, options, startMoment, endMoment) {
    	// 刻度
    	var scales = [];
    	var group = snap.group();
    	this.group = group;
    	// tx, ty 是translate的位置
    	this.tx = 0;
    	this.ty = 0;
    	console.log(startMoment);
    	var helpRectTempl = "M {ox},{oy} h {width} v {height} h -{width} z";
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
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('YYYY年MM月'));
    				text.attr(options.fontAttr);
    				group.add(text);
    			}
    		}
    		else if (options.scale.timeUnitSpan === 'weeks') {
    			if (scale.moment.week() % 10 == 0) {
    				var scaleHeight = options.scale.timeUnitVLinePx + options.fontAttr['font-size'] * 2;
    				// 将刻度变长
    				scale.ele.attr({'y2': scaleHeight + scale.rect.y});
    				// 刻字
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('YYYY年MM月DD日'));
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
    				var text = snap.text(scale.rect.x + 2, scaleHeight + scale.rect.y, scale.moment.format('YYYY年MM月DD日'));
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