"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var noQueue = (function () {
    function noQueue(conf) {
        this.config = { delay: 1000 };
        this.events = {};
        this.queue = {};
        this.order = [];
        this.counter = 0;
        this.currentThread = '';
        this.stopped = false;
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
        if (typeof eventName !== 'string')
            throw new TypeError('Event name wasn\'t a string');
        if (typeof callback !== 'function')
            throw new TypeError('Callback wasn\'t a function');
        if (!this.isExistedEvent(eventName)) {
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
        if (typeof eventName !== 'string')
            throw new TypeError('Event name wasn\'t a string');
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
        if (typeof this.queue[name] !== 'undefined')
            throw new TypeError(name + " was existed in queue");
        if (typeof name !== 'string')
            throw new TypeError('`name` was not string');
        if (typeof callback !== 'function')
            throw new TypeError('`callback` was not function');
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
        this.currentThread = this.order[this.counter++];
        return this.queue[this.currentThread];
    };
    noQueue.prototype.worker = function () {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        if (this.handler !== null || this.stopped)
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
            _self.emit('error', error);
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
        this.stopped = false;
        this.worker();
        return true;
    };
    noQueue.prototype.stop = function () {
        clearTimeout(this.handler);
        this.stopped = true;
        this.handler = null;
        this.counter = 0;
        return true;
    };
    return noQueue;
}());
exports.noQueue = noQueue;
//# sourceMappingURL=noqueue.js.map