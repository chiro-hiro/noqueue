"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class noQueue {
    constructor(conf) {
        this.config = { delay: 1000 };
        this.events = {};
        this.queue = {};
        this.order = [];
        this.counter = 0;
        if (conf) {
            this.config.delay = conf.delay;
        }
    }
    getOnceEventName(event) {
        return `___once_event___${event}`;
    }
    isExistedEvent(eventName) {
        return typeof this.events[eventName] !== 'undefined';
    }
    then(callback) {
        return this.once('___then___', callback);
    }
    catch(callback) {
        return this.once('___catch___', callback);
    }
    resolve(value) {
        return this.emit('___then___', value);
    }
    reject(error) {
        return this.emit('___catch___', error);
    }
    on(eventName, callback) {
        if (typeof (this.events[eventName]) === 'undefined') {
            this.events[eventName] = [callback];
        }
        else {
            this.events[eventName].push(callback);
        }
        return this;
    }
    once(eventName, callback) {
        return this.on(this.getOnceEventName(eventName), callback);
    }
    emit(eventName, ...params) {
        if (!eventName)
            return this;
        let onceEvent = this.getOnceEventName(eventName);
        if (this.isExistedEvent(eventName)) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                let callback = this.events[eventName][i];
                if (typeof callback === 'function')
                    callback.apply(null, params);
            }
        }
        if (this.isExistedEvent(onceEvent)) {
            for (let i = 0; i < this.events[onceEvent].length; i++) {
                let callback = this.events[onceEvent][i];
                if (typeof callback === 'function')
                    callback.apply(null, params);
            }
            delete this.events[onceEvent];
        }
        return this;
    }
    add(name, callback) {
        if (typeof this.queue[name] !== 'undefined' || typeof callback !== 'function')
            return this;
        this.queue[name] = callback;
        this.order.push(name);
        return this;
    }
    remove(name) {
        if (typeof this.queue[name] !== 'undefined') {
            this.order.splice(this.order.indexOf(name), 1);
            delete this.queue[name];
        }
        return this;
    }
    next() {
        if (this.counter >= this.order.length
            || typeof (this.order[this.counter]) === 'undefined') {
            this.counter = 0;
        }
        return this.queue[this.order[this.counter++]];
    }
    worker(...params) {
        if (this.handler !== null)
            return;
        let _self = this;
        let nextFunction = this.next();
        let ret = [];
        if (typeof nextFunction === 'undefined' && this.handler === null) {
            this.handler = setTimeout(() => {
                this.handler = null;
                this.worker();
            }, this.config.delay);
            return;
        }
        nextFunction.apply(null, params)
            .then((value) => {
            if (value
                && typeof (value) === 'object'
                && typeof (value.name) !== 'undefined'
                && typeof (value.data) !== 'undefined') {
                this.emit(value.name, value.data);
            }
            ret = [value];
        })
            .catch((error) => {
            console.error('[noQueue]', error);
        })
            .finally(function () {
            if (_self.handler === null) {
                _self.handler = setTimeout(() => {
                    _self.handler = null;
                    _self.worker.apply(_self, ret);
                }, _self.config.delay);
            }
        });
    }
    start() {
        clearTimeout(this.handler);
        this.handler = null;
        this.worker();
    }
    stop() {
        clearTimeout(this.handler);
        this.handler = null;
        this.counter = 0;
    }
}
exports.noQueue = noQueue;
//# sourceMappingURL=noqueue.js.map