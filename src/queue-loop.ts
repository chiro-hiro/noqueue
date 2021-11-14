import { EventDispatcher } from './event-dispatcher';
import { IConfiguration, IQueueFunction } from './common';
import TimeDuration from './time-duration';

/**
 * [[include: queue-loop-001.md]]
 * @export
 * @class QueueLoop
 * @extends {EventDispatcher}
 */
export class QueueLoop extends EventDispatcher {
  /**
   * Configuration of QueueLoop
   * @private
   * @type {IConfiguration}
   * @memberof QueueLoop
   */
  private config: IConfiguration = { paddingTime: 1000 };

  /**
   * Mapping of job's name to job in queue
   * @private
   * @type {{ [key: string]: IQueueFunction }}
   * @memberof QueueLoop
   */
  private queue: { [key: string]: IQueueFunction } = {};

  /**
   * Job ordering by name
   * @private
   * @type {string[]}
   * @memberof QueueLoop
   */
  private order: string[] = [];

  /**
   * Padding time between jobs
   * @private
   * @type {{ [key: string]: number }}
   * @memberof QueueLoop
   */
  private paddingTime: { [key: string]: number } = {};

  /**
   * Counter to point out next job to be processed
   * @private
   * @type {number}
   * @memberof QueueLoop
   */
  private counter: number = 0;

  /**
   * Current working job name
   * @private
   * @type {string}
   * @memberof QueueLoop
   */
  private currentJob: string = '';

  /**
   * Timer handler
   * @private
   * @type {any}
   * @memberof QueueLoop
   */
  private handler: any;

  /**
   * Working sate of queue
   * @private
   * @type {boolean}
   * @memberof QueueLoop
   */
  private stopped: boolean = false;

  /**
   * Event will be emitted after one job is completed.
   * @event
   * @static
   * @memberof QueueLoop
   */
  static success = 'success';

  /**
   * Event will be emitted after one job is failed.
   * @event
   * @static
   * @memberof QueueLoop
   */
  static error = 'error';

  /**
   * Creates an instance of QueueLoop.
   * @param {Partial<IConfiguration>} conf Configuration that used to overwrite default configurations
   * @memberof QueueLoop
   */
  constructor(conf?: Partial<IConfiguration>) {
    super();
    this.config = { ...this.config, ...conf };
  }

  /**
   * Get list of job's name
   * @return {string[]}
   * @memberof QueueLoop
   */
  public getJobs(): string[] {
    return this.order;
  }

  /**
   * Get current working job
   * @return {string}
   * @memberof QueueLoop
   */
  public getCurrentJob(): string {
    return this.currentJob;
  }

  /**
   * Add job into queue and await for processing
   * @param {string} name Name of job
   * @param {IQueueFunction} func Job will be added to queue
   * @param {TimeDuration} paddingTimeTime=new TimeDuration() Padding time between jobs
   * @return {QueueLoop}
   * @memberof QueueLoop
   */
  public add(name: string, func: IQueueFunction, paddingTimeTime: TimeDuration = new TimeDuration()): QueueLoop {
    if (arguments.length < 2) throw new Error('Wrong number of arguments, expecting 2-3');
    if (typeof this.queue[name] !== 'undefined') throw new Error(`Duplicated, ${name} was existed in queue`);
    if (typeof name !== 'string') throw new TypeError('Invalid param, "name" was not string');
    if (typeof func !== 'function') throw new TypeError('Invalid param, "func" was not function');
    if (func.constructor.name !== 'AsyncFunction') throw new TypeError('Invalid param, "func" was not async function');
    this.paddingTime[name] = paddingTimeTime.toMillisecond();
    this.queue[name] = func;
    this.order.push(name);
    return this;
  }

  /**
   * Remove one job from queue by given name
   * @param {string} name Remove job from queue
   * @return {boolean}
   * @memberof QueueLoop
   */
  public remove(name: string): boolean {
    if (typeof this.queue[name] !== 'undefined') {
      this.order.splice(this.order.indexOf(name), 1);
      delete this.queue[name];
      delete this.paddingTime[name];
      return typeof this.queue[name] === 'undefined';
    }
    return false;
  }

  /**
   * Get next function in queue
   * @private
   * @return {IQueueFunction}
   * @memberof QueueLoop
   */
  private next(): IQueueFunction {
    // Empty queue
    if (this.order.length < 1) {
      return async () => {
        throw new Error('Queue is empty now');
      };
    }
    // Reset counter
    if (this.counter >= this.order.length || typeof this.order[this.counter] === 'undefined') this.counter = 0;
    this.currentJob = this.order[this.counter];
    this.counter += 1;
    return this.queue[this.currentJob];
  }

  /**
   * Worker that's actually do works
   * @private
   * @param {...any[]} params
   * @return {any}
   * @memberof QueueLoop
   */
  private worker(...params: any[]) {
    if (this.handler !== null || this.stopped) {
      this.emit('stop');
      return;
    }
    const nextFunction = this.next();
    let ret: any[] = [];
    if (typeof nextFunction === 'undefined' && this.handler === null) {
      // Register empty worker
      this.handler = setTimeout(() => {
        this.handler = null;
        this.worker();
      }, this.config.paddingTime);
      return;
    }
    nextFunction(...params)
      .then((returnValue: any) => {
        // Ret is alway an array
        ret = Array.isArray(returnValue) ? returnValue : [returnValue];
        this.emit('success', this.currentJob, ...ret);
      })
      .catch((error: Error) => {
        this.emit('error', this.currentJob, error);
      })
      .finally(() => {
        // Single worker
        if (this.handler === null) {
          this.handler = setTimeout(
            () => {
              this.handler = null;
              this.worker(...ret);
            },
            this.paddingTime[this.currentJob] > 0 ? this.paddingTime[this.currentJob] : this.config.paddingTime,
          );
        }
      });
  }

  /**
   * Start queue loop
   * @return {boolean}
   * @memberof QueueLoop
   */
  public start(): boolean {
    clearTimeout(this.handler);
    this.handler = null;
    this.stopped = false;
    this.worker();
    return true;
  }

  /**
   * Stop queue loop
   * @return {boolean}
   * @memberof QueueLoop
   */
  public stop(): boolean {
    clearTimeout(this.handler);
    this.stopped = true;
    this.handler = null;
    this.counter = 0;
    return true;
  }
}

export default QueueLoop;
