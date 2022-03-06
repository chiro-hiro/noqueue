import { Callback } from './common';

const onceTimePrefix = '\xca\xfe';

const specialPrefix = '\xbe\xef';

const getOnceTimeEventName = (v: string) => `${onceTimePrefix}${v}`;

const getSpecialName = (v: string) => `${specialPrefix}${v}`;

const isOnceTime = (v: string) => v.substring(0, 2) === onceTimePrefix;

const isSpecial = (v: string) => v.substring(0, 2) === specialPrefix;

/**
 * [[include: event-dispatcher-001.md]]
 * @export
 * @class EventDispatcher
 */
export class EventDispatcher {
  /**
   * Event pool
   * @private
   * @type {{ [key: string]: Callback[] }}
   * @memberof [[EventDispatcher]]
   */
  private events: { [key: string]: Callback[] } = {};

  /**
   * Check for event existence
   * @private
   * @param {string} eventName Event name
   * @return {boolean}
   * @memberof [[EventDispatcher]]
   */
  private isExists(eventName: string): boolean {
    return typeof this.events[eventName] !== 'undefined';
  }

  /**
   * Fake .then() method of Promise
   * @param {Callback} callback Callback function which will be triggered after .resolve()
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public then(callback: Callback): EventDispatcher {
    return this.once(getSpecialName('then'), callback);
  }

  /**
   * Fake .catch() method of Promise
   * @param {Callback} callback Callback function which will be triggered after .reject()
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public catch(callback: Callback): EventDispatcher {
    return this.once(getSpecialName('catch'), callback);
  }

  /**
   * Fake .resolve() method of Promise
   * @param {any} value Value to return in .then()
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public resolve(value: any): EventDispatcher {
    return this.emit(getSpecialName('then'), value);
  }

  /**
   * Fake .reject() method of Promise
   * @param {Error} error Error to return in .catch()
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public reject(error: Error): EventDispatcher {
    return this.emit(getSpecialName('catch'), error);
  }

  /**
   * Get all event names
   * @return {string[]} Array of event names
   * @memberof [[EventDispatcher]]
   */
  public eventNames(): string[] {
    const result: string[] = [];
    Object.keys(this.events).forEach((e) => {
      if (!isSpecial(e)) {
        const eventName = isOnceTime(e) ? e.substr(2) : e;
        if (!result.includes(eventName)) {
          result.push(eventName);
        }
      }
    });
    return result;
  }

  /**
   * Remove listeners for a given `eventName` otherwise all listeners
   * @param {string} eventName Name of event
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public removeAllListeners(eventName?: string): EventDispatcher {
    Object.keys(this.events).forEach((e) => {
      if (typeof eventName === 'string') {
        if (e === eventName || e === getOnceTimeEventName(e)) {
          delete this.events[e];
        }
      } else {
        delete this.events[e];
      }
    });
    return this;
  }

  /**
   * Add new event listener
   * @param {string} eventName Event name
   * @param {Callback} callback Callback that will be triggered if event emitted
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public on(eventName: string, callback: Callback): EventDispatcher {
    if (arguments.length < 2) throw new Error('Wrong number of arguments, eventName and callback is need');
    if (typeof eventName !== 'string') throw new TypeError('Event name was not a string');
    if (typeof callback !== 'function') throw new TypeError('Callback was not a function');
    if (!this.isExists(eventName)) {
      this.events[eventName] = [callback];
    } else {
      this.events[eventName].push(callback);
    }
    return this;
  }

  /**
   * Add event listener for one time event
   * @param {string} eventName Event name
   * @param {Callback} callback Callback that will be triggered if event emitted
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public once(eventName: string, callback: Callback): EventDispatcher {
    if (arguments.length < 2) throw new Error('Wrong number of arguments, eventName and callback is need');
    return this.on(getOnceTimeEventName(eventName), callback);
  }

  /**
   * Emit an event to listeners
   * @param {string} eventName Event name
   * @param {...any[]} params Parameters that we need to emit to listeners
   * @return {EventDispatcher}
   * @memberof [[EventDispatcher]]
   */
  public emit(eventName: string, ...params: any[]): EventDispatcher {
    if (typeof eventName !== 'string') throw new TypeError('Event name was not a string');

    const onceTimeEvent = getOnceTimeEventName(eventName);

    // Listened event
    if (this.isExists(eventName)) {
      for (let i = 0; i < this.events[eventName].length; i += 1) {
        const callback = this.events[eventName][i];
        if (typeof callback === 'function') callback.bind(null)(...params);
      }
    }

    // Listened once
    if (this.isExists(onceTimeEvent)) {
      for (let i = 0; i < this.events[onceTimeEvent].length; i += 1) {
        const callback = this.events[onceTimeEvent][i];
        if (typeof callback === 'function') callback.bind(null)(...params);
      }
      // Remove once time event after success called
      delete this.events[onceTimeEvent];
    }
    return this;
  }
}

export default EventDispatcher;
