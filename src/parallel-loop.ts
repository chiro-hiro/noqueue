import { EventDispatcher } from './event-dispatcher';
import { IConfiguration, IParallelFunction } from './common';
import TimeDuration from './time-duration';

/**
 * [[include: parallel-loop-001.md]]
 * @export
 * @class ParallelLoop
 * @extends {EventDispatcher}
 */
export class ParallelLoop extends EventDispatcher {
  /**
   * Configuration
   * @private
   * @type {IConfiguration}
   * @memberof ParallelLoop
   */
  private config: IConfiguration = { paddingTime: 100 };

  /**
   * Job pool
   * @private
   * @type {{ [key: string]: IParallelFunction }}
   * @memberof ParallelLoop
   */
  private pool: { [key: string]: IParallelFunction } = {};

  /**
   * Job sorted by time ordering
   * @private
   * @type {string[]}
   * @memberof ParallelLoop
   */
  private order: string[] = [];

  /**
   * Job lock to make sure there are no overlap
   * @private
   * @type {{ [key: string]: boolean }}
   * @memberof ParallelLoop
   */
  private lock: { [key: string]: boolean } = {};

  /**
   * Padding time between jobs
   * @private
   * @type {{ [key: string]: number }}
   * @memberof ParallelLoop
   */
  private paddingTime: { [key: string]: number } = {};

  /**
   * Schedule next trigger point
   * @private
   * @type {{ [key: string]: number }}
   * @memberof ParallelLoop
   */
  private scheduleTime: { [key: string]: number } = {};

  /**
   * Current active job's name
   * @private
   * @type {string}
   * @memberof ParallelLoop
   */
  private currentJob: string = '';

  /**
   * Internal clock
   * @private
   * @type {number}
   * @memberof ParallelLoop
   */
  private counter: number = 0;

  /**
   * Manager timeout handler id
   * @private
   * @type {any}
   * @memberof ParallelLoop
   */
  private handler: any;

  /**
   * Is parallel loop on action?
   * @private
   * @type {boolean}
   * @memberof ParallelLoop
   */
  private stopped: boolean = false;

  /**
   * Creates an instance of ParallelLoop.
   * @param {Partial<IConfiguration>} [conf]
   * @memberof ParallelLoop
   */
  constructor(conf?: Partial<IConfiguration>) {
    super();
    this.config = { ...this.config, ...conf };
  }

  /**
   * Add job in to pool
   * @param {string} name Name of job
   * @param {IParallelFunction} func Function that will be triggered
   * @param {TimeDuration} paddingTimeTime Padding time between executions
   * @return {ParallelLoop}
   * @memberof ParallelLoop
   */
  public add(name: string, func: IParallelFunction, paddingTimeTime: TimeDuration): ParallelLoop {
    if (arguments.length < 2) throw new Error('Wrong number of arguments');
    if (typeof this.pool[name] !== 'undefined') throw new Error(`Duplicated, ${name} was existed in pool`);
    if (typeof name !== 'string') throw new TypeError('Invalid param, "name" was not string');
    if (typeof func !== 'function') throw new TypeError('Invalid param, "func" was not function');
    this.paddingTime[name] = paddingTimeTime.toMillisecond();
    this.scheduleTime[name] = paddingTimeTime.toMillisecond() + Date.now();
    this.pool[name] = func;
    this.lock[name] = false;
    this.order.push(name);
    return this;
  }

  /**
   * Remove a job by a given name
   * @param {string} name Name of job
   * @return {boolean}
   * @memberof ParallelLoop
   */
  public remove(name: string): boolean {
    if (typeof this.pool[name] !== 'undefined') {
      this.order.splice(this.order.indexOf(name), 1);
      delete this.pool[name];
      delete this.paddingTime[name];
      return typeof this.pool[name] === 'undefined';
    }
    return false;
  }

  /**
   * Increase and get next job
   * @private
   * @memberof ParallelLoop
   */
  private getJob() {
    if (this.order.length < 1) {
      throw new Error('Pool is empty now');
    }
    if (this.counter >= this.order.length || typeof this.order[this.counter] === 'undefined') this.counter = 0;
    this.currentJob = this.order[this.counter];
    this.counter += 1;
  }

  /**
   * Worker who's actually do jobs
   * @private
   * @memberof ParallelLoop
   */
  private worker() {
    if (this.handler === null && this.stopped === false) {
      this.getJob();
      let ret: any[] = [];
      // Only trigger job that wasn't lock and on schedule
      if (this.lock[this.currentJob] === false && this.scheduleTime[this.currentJob] <= Date.now()) {
        // Handle async function and normal function separate
        if (this.pool[this.currentJob].constructor.name === 'AsyncFunction') {
          this.lock[this.currentJob] = true;
          // Trigger async function
          this.pool[this.currentJob]()
            .then((returnValue: any) => {
              // Ret is alway an array
              ret = Array.isArray(returnValue) ? returnValue : [returnValue];
              // Emit event
              this.emit('success', this.currentJob, ...ret);
            })
            .catch((err: Error) => {
              this.emit('error', this.currentJob, err);
            })
            .finally(() => {
              this.lock[this.currentJob] = false;
              this.scheduleTime[this.currentJob] = Date.now() + this.paddingTime[this.currentJob];
            });
        } else {
          // Trigger function
          try {
            this.lock[this.currentJob] = true;
            const returnValue = this.pool[this.currentJob]();
            ret = Array.isArray(returnValue) ? returnValue : [returnValue];
            this.emit('success', this.currentJob, ...ret);
          } catch (err) {
            this.emit('error', this.currentJob, err);
          } finally {
            this.lock[this.currentJob] = false;
            this.scheduleTime[this.currentJob] = Date.now() + this.paddingTime[this.currentJob];
          }
        }
      }
      if (this.handler === null) {
        this.handler = setTimeout(() => {
          this.handler = null;
          this.worker();
        }, this.config.paddingTime);
      }
    }
  }

  /**
   * Start parallel loop
   * @return {boolean}
   * @memberof ParallelLoop
   */
  public start(): boolean {
    if (this.stopped) {
      clearTimeout(this.handler);
      this.handler = null;
      this.stopped = false;
      this.worker();
      return true;
    }
    return false;
  }

  /**
   * Stop parallel loop
   * @return {boolean}
   * @memberof ParallelLoop
   */
  public stop(): boolean {
    if (!this.stopped) {
      clearTimeout(this.handler);
      this.handler = null;
      this.stopped = true;
      this.counter = 0;
      return true;
    }
    return false;
  }
}

export default ParallelLoop;
