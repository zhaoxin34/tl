'use strict';
(function() {
    function Analytics() {

    }
    var ana = new Analytics();
    /**
     * 触发一次page的调用，可选的参数有分类，名称和属性
     *
     *
     * @param {string} [分类]
     * @param {string} [名称]
     * @param {Object|string} [属性]
     * @param {Object} [options]
     * @param {Function} [fn]
     * @return {Analytics}
     */

    Analytics.prototype.page = function(category, name, properties, options, fn) {
    	console.log('page', properties);
        return this;
    };

    /**
     * 触发pv动作，传入url
     * 这个调用将进一步调用page方法，并将url作为properties.path传给page作为参数
     *
     * @param {string} [url]
     * @return {Analytics}
     * @api private
     */

    Analytics.prototype.pageview = function(url) {
        var properties = {};
        if (url) {
            properties.path = url;
        }
        this.page(undefined, undefined, properties);
        return this;
    };

    // 从前台活的analytics对象
    var _analytics = window.analytics;

    // 循环调用前台希望的数据
    for (var i = 0; i < _analytics.length; i++) {
    	var callback = _analytics[i];
        var methodName = callback.slice(0, 1);
        var args = callback.slice(1);
        if (ana[methodName] !== undefined) {
        	ana[methodName].apply(ana, args);
        }
    }
})();
