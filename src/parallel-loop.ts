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
  private config: IConfiguration = { paddingTime: 10 };

  /**
   * Jobs's pool
   * @private
   * @type {{ [key: string]: IParallelFunction }}
   * @memberof ParallelLoop
   */
  private pool: { [key: string]: IParallelFunction } = {};

  /**
   * Jobs sorted by time ordering
   * @private
   * @type {string[]}
   * @memberof ParallelLoop
   */
  private order: string[] = [];

  /**
   * Job's lock to make sure there are no overlap
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
   * Internal clock
   * @private
   * @type {number}
   * @memberof ParallelLoop
   */
  private counter: number = 0;

  /**
   * Manage timeout handler id
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
   * Add job into pool
   * @param {string} name Name of job
   * @param {IParallelFunction} func Function that will be triggered
   * @param {TimeDuration} paddingTimeTime Padding time between executions
   * @return {ParallelLoop}
   * @memberof ParallelLoop
   */
  public add(
    name: string,
    func: IParallelFunction,
    paddingTimeTime: TimeDuration = TimeDuration.fromMillisecond(10),
  ): ParallelLoop {
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
   * Worker who's actually do jobs
   * @private
   * @memberof ParallelLoop
   */
  private worker() {
    if (this.handler === null && this.stopped === false) {
      let ret: any[] = [];
      for (let i = 0; i < this.order.length; i += 1) {
        const jobName = this.order[i];
        // Only trigger job that wasn't lock and on schedule
        if (this.lock[jobName] === false && this.scheduleTime[jobName] <= Date.now()) {
          // Handle async function and normal function separate
          if (this.pool[jobName].constructor.name === 'AsyncFunction') {
            this.lock[jobName] = true;
            // Trigger async function
            this.pool[jobName]()
              // eslint-disable-next-line no-loop-func
              .then((returnValue: any) => {
                // Ret is alway an array
                ret = Array.isArray(returnValue) ? returnValue : [returnValue];
                // Emit event
                this.emit('success', jobName, ...ret);
              })
              .catch((err: Error) => {
                this.emit('error', jobName, err);
              })
              .finally(() => {
                this.lock[jobName] = false;
                this.scheduleTime[jobName] = Date.now() + this.paddingTime[jobName];
              });
          } else {
            // Trigger function
            try {
              this.lock[jobName] = true;
              const returnValue = this.pool[jobName]();
              ret = Array.isArray(returnValue) ? returnValue : [returnValue];
              this.emit('success', jobName, ...ret);
            } catch (err) {
              this.emit('error', jobName, err);
            } finally {
              this.lock[jobName] = false;
              this.scheduleTime[jobName] = Date.now() + this.paddingTime[jobName];
            }
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
    clearTimeout(this.handler);
    this.handler = null;
    this.stopped = false;
    this.worker();
    return true;
  }

  /**
   * Stop parallel loop
   * @return {boolean}
   * @memberof ParallelLoop
   */
  public stop(): boolean {
    clearTimeout(this.handler);
    this.handler = null;
    this.stopped = true;
    this.counter = 0;
    return true;
  }
}

export default ParallelLoop;
