import { EventDispatcher } from './event-dispatcher'
import { TimeSchedule, Settings } from './utilities'

export class Queue extends EventDispatcher {

  private config: Settings = { delay: TimeSchedule.everySecond }

  private queue: any = {}

  private order: Array<string> = []

  private paddingTime: any = {};

  private scheduleTime: any = {};

  private counter: number = 0

  private currentThread: string = ''

  private handler: any

  private stopped: boolean = false

  constructor(conf?: Settings) {
    super()
    if (conf) {
      this.config.delay = conf.delay
    }
  }

  //Add callback to queue
  public add(name: string, callback: Function, paddingTimeTime: number = 0): Queue {
    if (arguments.length < 2) throw new Error('Wrong number of agurments')
    if (typeof this.queue[name] !== 'undefined') throw new TypeError(`${name} was existed in queue`)
    if (typeof name !== 'string') throw new TypeError('`name` was not string')
    if (typeof callback !== 'function') throw new TypeError('`callback` was not function')
    this.paddingTime[name] = paddingTimeTime
    this.scheduleTime[name] = paddingTimeTime + Date.now()
    this.queue[name] = callback
    this.order.push(name)
    return this
  }

  //Remove callack from queue
  public remove(name: string): boolean {
    if (typeof this.queue[name] !== 'undefined') {
      this.order.splice(this.order.indexOf(name), 1)
      delete this.queue[name]
      delete this.paddingTime[name]
      delete this.scheduleTime[name]
      return typeof this.queue[name] === 'undefined';
    }
    return false;
  }

  //Next function in queue
  private next(): Function {
    //Empty queue
    if (this.order.length < 1) return (async () => { throw new Error('Queue is empty now') })
    //Reset counter
    if (this.counter >= this.order.length || typeof (this.order[this.counter]) === 'undefined') this.counter = 0
    let _self = this;
    let curTime = Date.now()
    this.currentThread = this.order[this.counter++]
    if (curTime >= this.scheduleTime[this.currentThread]) {
      //Scheduling for next run
      this.scheduleTime[this.currentThread] = curTime + this.paddingTime[this.currentThread]
      return this.queue[this.currentThread]
    }
    return (async () => { _self.emit('time-leap', this.currentThread, this.scheduleTime[this.currentThread]) })
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
          //@ts-ignore
          this.emit.apply(this, [value.name].concat(value.data));
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