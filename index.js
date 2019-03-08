'user strict';

//Constructor method
function noQueue(options) {
  let settings = {
    delay: 1000
  };
  for (let i in options) {
    settings[i] = options[i];
  }
  this._settings = settings;
  this._queue = {};
  this._order = [];
  this._counter = 0;
  this._handler = 0;
  this._events = {};
  return this;
}

noQueue.prototype = {

  //Get once event
  _getOnceEventName: (event) => (`___once_event___${event}`),

  //Execute on success
  then: function (callback) {
    return this.once('___then___', callback);
  },

  //Execute on error
  catch: function (callback) {
    return this.once('___catch___', callback);
  },

  //Resolve
  resolve: function (value) {
    return this.emit('___then___', value);
  },

  //Reject
  reject: function (error) {
    return this.emit('___catch___', error);
  },

  //Register event
  once: function (eventName, callback) {
    return this.on(this._getOnceEventName(eventName), callback);
  },

  //Register event
  on: function (eventName, callback) {
    if (typeof (callback) !== 'function') throw new TypeError('Invalid callback function');
    if (typeof (this._events[eventName]) === 'undefined') {
      this._events[eventName] = [callback];
    } else {
      this._events[eventName].push(callback);
    }
    return this;
  },

  //Emit event
  emit: function () {
    let params = Array.from(arguments);
    if (params.length === 0) return;
    let eventName = params[0];
    let onceEvent = this._getOnceEventName(eventName);

    //Listented event
    if (typeof this._events[eventName] !== 'undefined' && Array.isArray(this._events[eventName])) {
      for (let i = 0; i < this._events[eventName].length; i++) {
        let callback = this._events[eventName][i];
        if (typeof callback === 'function') {
          callback.apply(null, params.slice(1));
        }
      }
    }

    //Listented once
    if (typeof this._events[onceEvent] !== 'undefined' && Array.isArray(this._events[onceEvent])) {
      for (let i = 0; i < this._events[onceEvent].length; i++) {
        let callback = this._events[onceEvent][i];
        if (typeof callback === 'function') {
          callback.apply(null, params.slice(1));
        }
      }
      //Remove event after success called
      delete this._events[onceEvent];
    }
    return this;
  },

  //Add callback to queue
  add: function (name, callback) {
    if (typeof (this._queue[name]) !== 'undefined') throw new Error('Existed `' + name + '` callback alias');
    if (typeof (callback) !== 'function') throw new TypeError('Invalid callback function');
    this._queue[name] = callback;
    this._order.push(name);
    return this;
  },

  //Remove callack from queue
  remove: function (name) {
    if (typeof (this._queue[name]) !== 'undefined') {
      this._order.splice(this._order.indexOf(name), 1);
      delete this._queue[name];
    }
    return this;
  },

  //Next function in queue
  _next: function () {
    if (this._counter >= this._order.length
      || typeof (this._order[this._counter]) === 'undefined') {
      this._counter = 0;
    }
    return this._queue[this._order[this._counter++]];
  },

  //Worker instance
  _worker: function () {
    if (this._handler !== 0) return;
    let _self = this;
    let params = Array.from(arguments);
    let nextFunction = this._next();
    let ret = [];
    if (typeof nextFunction === 'undefined' && this._handler === 0) {
      //Register empty worker
      this._handler = setTimeout(() => {
        this._handler = 0;
        this._worker();
      }, this._settings.delay);
      return;
    }
    nextFunction.apply(null, params)
      .then((value) => {
        //Trigger event if existing
        if (value
          && typeof (value) === 'object'
          && typeof (value.name) !== 'undefined'
          && typeof (value.data) !== 'undefined') {
          //Emit event
          this.emit(value.name, value.data);
        }
        ret = [value];
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(function () {

        //Single worker
        if (_self._handler === 0) {
          _self._handler = setTimeout(() => {
            _self._handler = 0;
            _self._worker.apply(_self, ret);
          }, _self._settings.delay);
        }
      });
  },

  //Start woker
  start: function () {
    clearTimeout(this._handler);
    this._handler = 0;
    this._worker();
  },

  //Stop worker
  stop: function () {
    clearTimeout(this._handler);
    this._counter = 0;
  }
}

//Export module
module.exports = noQueue;
