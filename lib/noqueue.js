"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var noQueue = (function () {
    function noQueue(conf) {
        this.config = { delay: 1000 };
        this.events = {};
        this.queue = {};
        this.order = [];
        this.paddingTime = {};
        this.scheduleTime = {};
        this.counter = 0;
        this.currentThread = '';
        this.stopped = false;
        if (conf) {
            this.config.delay = conf.delay;
        }
    }
    noQueue.toTime = function (hour, min, sec) {
        if (hour === void 0) { hour = 0; }
        if (min === void 0) { min = 0; }
        if (sec === void 0) { sec = 0; }
        return ((hour * 60 + min) * 60 + sec) * 1000;
    };
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
    noQueue.prototype.add = function (name, callback, paddingTimeTime) {
        if (paddingTimeTime === void 0) { paddingTimeTime = 0; }
        if (arguments.length < 2)
            throw new Error('Expecting 2 or 3 arguments');
        if (typeof this.queue[name] !== 'undefined')
            throw new TypeError(name + " was existed in queue");
        if (typeof name !== 'string')
            throw new TypeError('`name` was not string');
        if (typeof callback !== 'function')
            throw new TypeError('`callback` was not function');
        this.paddingTime[name] = paddingTimeTime;
        this.scheduleTime[name] = paddingTimeTime + Date.now();
        this.queue[name] = callback;
        this.order.push(name);
        return this;
    };
    noQueue.prototype.remove = function (name) {
        if (typeof this.queue[name] !== 'undefined') {
            this.order.splice(this.order.indexOf(name), 1);
            delete this.queue[name];
            delete this.paddingTime[name];
            delete this.scheduleTime[name];
        }
        return this;
    };
    noQueue.prototype.next = function () {
        var _this = this;
        if (this.order.length < 1)
            return (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                throw new Error('Queue is empty now');
            }); }); });
        if (this.counter >= this.order.length || typeof (this.order[this.counter]) === 'undefined')
            this.counter = 0;
        var _self = this;
        var curTime = Date.now();
        this.currentThread = this.order[this.counter++];
        if (curTime >= this.scheduleTime[this.currentThread]) {
            this.scheduleTime[this.currentThread] = curTime + this.paddingTime[this.currentThread];
            return this.queue[this.currentThread];
        }
        return (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            _self.emit('time-leap', this.currentThread, this.scheduleTime[this.currentThread]);
            return [2];
        }); }); });
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
    noQueue.EVERY_DAY = noQueue.toTime(24);
    noQueue.EVERY_HOUR = noQueue.toTime(1);
    noQueue.EVERY_MINUTE = noQueue.toTime(0, 1);
    return noQueue;
}());
exports.noQueue = noQueue;
//# sourceMappingURL=noqueue.js.map