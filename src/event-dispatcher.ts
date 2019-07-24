import { getOnceTimeEventName } from "./utilities"

export class EventDispatcher {

  //Event pool
  private events: any = {}

  //Check for event's existance
  private isExists(eventName: string): boolean {
    return typeof this.events[eventName] !== 'undefined'
  }

  //Execute on success
  public then(callback: Function): EventDispatcher {
    return this.once('___then___', callback)
  }

  //Execute on error
  public catch(callback: Function): EventDispatcher {
    return this.once('___catch___', callback)
  }

  //Resolve
  public resolve(value: any): EventDispatcher {
    return this.emit('___then___', value)
  }

  //Reject
  public reject(error: Error): EventDispatcher {
    return this.emit('___catch___', error)
  }

  //Add event handler
  public on(eventName: string, callback: Function): EventDispatcher {
    if (arguments.length < 2) throw new Error('Wrong number of agurments')
    if (typeof eventName !== 'string') throw new TypeError('Event name was not a string')
    if (typeof callback !== 'function') throw new TypeError('Callback was not a function')
    if (!this.isExists(eventName)) {
      this.events[eventName] = [callback]
    } else {
      this.events[eventName].push(callback)
    }
    return this
  }

  //Add once time event
  public once(eventName: string, callback: Function): EventDispatcher {
    if (arguments.length < 2) throw new Error('Wrong number of agurments')
    return this.on(getOnceTimeEventName(eventName), callback)
  }

  //Emit event
  public emit(eventName: string, ...params: any): EventDispatcher {
    if (typeof eventName !== 'string') throw new TypeError('Event name was not a string')

    let onceTimeEvent = getOnceTimeEventName(eventName)

    //Listented event
    if (this.isExists(eventName)) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        let callback = this.events[eventName][i]
        if (typeof callback === 'function') callback.apply(null, params)
      }
    }

    //Listented once
    if (this.isExists(onceTimeEvent)) {
      for (let i = 0; i < this.events[onceTimeEvent].length; i++) {
        let callback = this.events[onceTimeEvent][i]
        if (typeof callback === 'function') callback.apply(null, params)
      }
      //Remove once time event after success called
      delete this.events[onceTimeEvent]
    }
    return this
  }

}