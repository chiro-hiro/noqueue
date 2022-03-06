/**
 * Defined type for callback function.
 * _Please take note that, its returned value will be ignored._
 * @export
 * */
export type Callback = (...params: any[]) => void;

/**
 * Logger interface
 * @export
 * */
export interface ILogger {
  debug(...params: any[]): void;
}

/**
 * Job type was used in [[QueueLoop.add]], they need to be `async function`.
 * _Don't try your luck with normal function_
 * @export
 * */
export type IQueueFunction = (...params: any[]) => Promise<any>;

/**
 * Job type was used in [[ParallelLoop.add]], they need could be `function` or `async function`.
 * @export
 * */
export type IParallelFunction = (...params: any[]) => any;

/**
 * Configuration interface that will be used in [[ParallelLoop.constructor]] and [[QueueLoop.constructor]].
 * @export
 * @interface [[IConfiguration]]
 */
export interface IConfiguration {
  /**
   * Awaiting time between jobs
   * @type {number}
   * @memberof [[IConfiguration]]
   */
  paddingTime: number;

  /**
   * Logger instance to help debug process
   * @type {ILogger}
   * @memberof [[IConfiguration]]
   */
  logger?: ILogger;
}

/**
 * Result of [[Fill]]
 * @export
 * @interface IFillResult
 */
export interface IFillResult {
  /**
   * Did it successful or error occurred?
   * @type {boolean}
   * @memberof IFillResult
   */
  success: boolean;

  /**
   * It's depend on [[IFillResult.success]], it's usually `any` kind of data,
   * it will be an `Error` when [[IFillResult.success]] is `false`
   * @type {(any | Error)}
   * @memberof IFillResult
   */
  result: any | Error;
}
