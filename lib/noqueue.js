"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var noQueue = (function () {
    function noQueue(conf) {
        this.config = { delay: 1000 };
        this.events = {};
        this.queue = {};
        this.order = [];
        this.counter = 0;
        if (conf) {
            this.config.delay = conf.delay;
        }
    }
    noQueue.prototype.getOnceEventName = function (event) {
        return "___once_event___" + event;
    };
    noQueue.prototype.isExistedEvent = function (eventName) {
        return typeof this.events[eventName] !== 'undefined';
    };
    noQueue.prototype.then = function (callback) {
        return this.once('___then___', callback);
    };
    noQueue.prototype.catch = function (callback) {
        return this.once('___catch___', callback);
    };
    noQueue.prototype.resolve = function (value) {
        return this.emit('___then___', value);
    };
    noQueue.prototype.reject = function (error) {
        return this.emit('___catch___', error);
    };
    noQueue.prototype.on = function (eventName, callback) {
        if (typeof (this.events[eventName]) === 'undefined') {
            this.events[eventName] = [callback];
        }
        else {
            this.events[eventName].push(callback);
        }
        return this;
    };
    noQueue.prototype.once = function (eventName, callback) {
        return this.on(this.getOnceEventName(eventName), callback);
    };
    noQueue.prototype.emit = function (eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        if (!eventName)
            return this;
        var onceEvent = this.getOnceEventName(eventName);
        if (this.isExistedEvent(eventName)) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                var callback = this.events[eventName][i];
                if (typeof callback === 'function')
                    callback.apply(null, params);
            }
        }
        if (this.isExistedEvent(onceEvent)) {
            for (var i = 0; i < this.events[onceEvent].length; i++) {
                var callback = this.events[onceEvent][i];
                if (typeof callback === 'function')
                    callback.apply(null, params);
            }
            delete this.events[onceEvent];
        }
        return this;
    };
    noQueue.prototype.add = function (name, callback) {
        if (typeof this.queue[name] !== 'undefined' || typeof callback !== 'function')
            return this;
        this.queue[name] = callback;
        this.order.push(name);
        return this;
    };
    noQueue.prototype.remove = function (name) {
        if (typeof this.queue[name] !== 'undefined') {
            this.order.splice(this.order.indexOf(name), 1);
            delete this.queue[name];
        }
        return this;
    };
    noQueue.prototype.next = function () {
        if (this.counter >= this.order.length
            || typeof (this.order[this.counter]) === 'undefined') {
            this.counter = 0;
        }
        return this.queue[this.order[this.counter++]];
    };
    noQueue.prototype.worker = function () {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        if (this.handler !== null)
            return;
        var _self = this;
        var nextFunction = this.next();
        var ret = [];
        if (typeof nextFunction === 'undefined' && this.handler === null) {
            this.handler = setTimeout(function () {
                _this.handler = null;
                _this.worker();
            }, this.config.delay);
            return;
        }
        nextFunction.apply(null, params)
            .then(function (value) {
            if (value
                && typeof (value) === 'object'
                && typeof (value.name) !== 'undefined'
                && typeof (value.data) !== 'undefined') {
                _this.emit(value.name, value.data);
            }
            ret = [value];
        })
            .catch(function (error) {
            console.error('[noQueue]', error);
        })
            .finally(function () {
            if (_self.handler === null) {
                _self.handler = setTimeout(function () {
                    _self.handler = null;
                    _self.worker.apply(_self, ret);
                }, _self.config.delay);
            }
        });
    };
    noQueue.prototype.start = function () {
        clearTimeout(this.handler);
        this.handler = null;
        this.worker();
    };
    noQueue.prototype.stop = function () {
        clearTimeout(this.handler);
        this.handler = null;
        this.counter = 0;
    };
    return noQueue;
}());
exports.noQueue = noQueue;
//# sourceMappingURL=noqueue.js.map