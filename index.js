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

//Register event
noQueue.prototype.on = function (eventName, callback) {
  if (typeof (callback) !== 'function') throw new TypeError('Invalid callback function');
  if (typeof (this._events[eventName]) === 'undefined') {
    this._events[eventName] = [callback];
  } else {
    this._events[eventName].push(callback);
  }
  return true;
}

//Emit event
noQueue.prototype.emit = function (eventName, data) {
  if (typeof (this._events[eventName]) !== 'undefined' && Array.isArray(this._events[eventName])) {
    for (let i = 0; i < this._events[eventName].length; i++) {
      //Force data cast
      if (typeof (data) === 'undefined' || !Array.isArray(data)) {
        data = [];
      }
      this._events[eventName][i].apply(null, data);
    }
    return true;
  }
  return false;
}

//Add callback to queue
noQueue.prototype.add = function (name, callback) {
  if (typeof (this._queue[name]) !== 'undefined') throw new Error('Existed `' + name + '` callback alias');
  if (typeof (callback) !== 'function') throw new TypeError('Invalid callback function');
  this._queue[name] = callback;
  this._order.push(name);
  return true;
}

//Remove callack to queue
noQueue.prototype.remove = function (name) {
  if (typeof (this._queue[name]) !== 'undefined') {
    this._order.splice(this._order.indexOf(name), 1);
    return (delete this._queue[name]);
  }
  return false;
}

//Next function in queue
noQueue.prototype._next = function () {
  if (this._counter >= this._order.length
    || typeof (this._order[this._counter]) === 'undefined') {
    this._counter = 0;
  }
  return this._queue[this._order[this._counter++]];
}

//Worker instance
noQueue.prototype._worker = function () {
  if (this._handler !== 0) return;
  this._next()
    .apply(null)
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
      if (this._order.length > 0) {
        this._handler = setTimeout(() => {
          this._handler = 0;
          this._worker();
        }, this._settings.delay);
      }
    });
}

//Start woker
noQueue.prototype.start = function () {
  clearTimeout(this._handler);
  this._handler = 0;
  this._worker();
}

//Stop worker
noQueue.prototype.stop = function () {
  clearTimeout(this._handler);
  this._counter = 0;
}

//Export module
module.exports = noQueue;
