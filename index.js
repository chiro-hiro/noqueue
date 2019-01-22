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
    if (typeof this._events[eventName] !== 'undefined' && Array.isArray(this._events[eventName])) {
      for (let i = 0; i < this._events[eventName].length; i++) {
        let callback = this._events[eventName][i];
        if (typeof callback === 'function') {
          callback.apply(null, params.slice(1));
        }
      }
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

  //Remove callack to queue
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
    let nextFunction = this._next();
    if (typeof nextFunction === 'undefined' && this._handler === 0) {
      //Register empty worker
      this._handler = setTimeout(() => {
        this._handler = 0;
        this._worker();
      }, this._settings.delay);
      return;
    }
    nextFunction.apply(null)
      .then((event) => {
        //Trigger event if existing
        if (typeof (event) === 'object'
          && typeof (event.eventName) !== 'undefined'
          && typeof (event.data) !== 'undefined') {
          //Emit event
          this.emit(event.eventName, event.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        //Single worker
        if (this._handler === 0) {
          this._handler = setTimeout(() => {
            this._handler = 0;
            this._worker();
          }, this._settings.delay);
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
