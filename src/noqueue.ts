export interface settings {
  delay: number
}

export class noQueue {

  private config: settings = { delay: 1000 }

  private events: any = {}

  private queue: any = {}

  private order: Array<string> = []

  private counter: number = 0

  private currentThread: string = ''

  private handler: any

  private stopped: boolean = false

  constructor(conf?: settings) {
    if (conf) {
      this.config.delay = conf.delay
    }
  }

  private getOnceEventName(event: string): string {
    return `___once_event___${event}`
  }

  private isExistedEvent(eventName: string): boolean {
    return typeof this.events[eventName] !== 'undefined'
  }

  //Execute on success
  then(callback: Function): noQueue {
    return this.once('___then___', callback)
  }

  //Execute on error
  catch(callback: Function): noQueue {
    return this.once('___catch___', callback)
  }

  //Resolve
  resolve(value: any): noQueue {
    return this.emit('___then___', value)
  }

  //Reject
  reject(error: Error): noQueue {
    return this.emit('___catch___', error)
  }


  //Add event handler
  public on(eventName: string, callback: Function): noQueue {
    if (typeof eventName !== 'string') throw new TypeError('Event name wasn\'t a string')
    if (typeof callback !== 'function') throw new TypeError('Callback wasn\'t a function')
    if (!this.isExistedEvent(eventName)) {
      this.events[eventName] = [callback]
    } else {
      this.events[eventName].push(callback)
    }
    return this
  }

  //Add once time event
  public once(eventName: string, callback: Function): noQueue {
    return this.on(this.getOnceEventName(eventName), callback)
  }

  //Emit event
  public emit(eventName: string, ...params: any): noQueue {
    if (typeof eventName !== 'string') throw new TypeError('Event name wasn\'t a string')

    let onceEvent = this.getOnceEventName(eventName)

    //Listented event
    if (this.isExistedEvent(eventName)) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        let callback = this.events[eventName][i]
        if (typeof callback === 'function') callback.apply(null, params)
      }
    }

    //Listented once
    if (this.isExistedEvent(onceEvent)) {
      for (let i = 0; i < this.events[onceEvent].length; i++) {
        let callback = this.events[onceEvent][i]
        if (typeof callback === 'function') callback.apply(null, params)
      }
      //Remove once time event after success called
      delete this.events[onceEvent]
    }
    return this
  }

  //Add callback to queue
  public add(name: string, callback: Function): noQueue {
    if (typeof this.queue[name] !== 'undefined') throw new TypeError(`${name} was existed in queue`)
    if (typeof name !== 'string') throw new TypeError('`name` was not string')
    if (typeof callback !== 'function') throw new TypeError('`callback` was not function')
    this.queue[name] = callback
    this.order.push(name)
    return this
  }

  //Remove callack from queue
  public remove(name: string): noQueue {
    if (typeof this.queue[name] !== 'undefined') {
      this.order.splice(this.order.indexOf(name), 1)
      delete this.queue[name]
    }
    return this
  }

  //Next function in queue
  private next(): Function {
    if (this.counter >= this.order.length
      || typeof (this.order[this.counter]) === 'undefined') {
      this.counter = 0
    }
    this.currentThread = this.order[this.counter++]
    return this.queue[this.currentThread]
  }

  //Worker instance
  private worker(...params: any) {
    if (this.handler !== null || this.stopped) return
    let _self = this
    let nextFunction = this.next()
    let ret: any = []
    if (typeof nextFunction === 'undefined' && this.handler === null) {
      //Register empty worker
      this.handler = setTimeout(() => {
        this.handler = null
        this.worker()
      }, this.config.delay)
      return
    }
    nextFunction.apply(null, params)
      .then((value: any) => {
        //Trigger event if existing
        if (value
          && typeof (value) === 'object'
          && typeof (value.name) !== 'undefined'
          && typeof (value.data) !== 'undefined') {
          //Emit event
          this.emit(value.name, value.data)
        }
        ret = [value]
      })
      .catch((error: Error) => {
        _self.emit('error', error)
      })
      .finally(function () {
        //Single worker
        if (_self.handler === null) {
          _self.handler = setTimeout(() => {
            _self.handler = null
            _self.worker.apply(_self, ret)
          }, _self.config.delay)
        }
      })
  }

  //Start woker
  public start() {
    clearTimeout(this.handler)
    this.handler = null
    this.stopped = false
    this.worker()
    return true
  }

  //Stop worker
  public stop() {
    clearTimeout(this.handler)
    this.stopped = true
    this.handler = null
    this.counter = 0
    return true
  }
}