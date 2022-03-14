import { IQueueFunction, IFillResult } from './common';

/**
 * Start everything at the same time,
 * It will return and array of [[IFillResult]]
 * [[include: utilities-fill-001.md]]
 * @export
 * @param {...IQueueFunction[]} asyncFunctions Async function that will be added
 * @return {Promise<IFillResult[]>}
 */

function isPromise(p: any): boolean {
  if (typeof p === 'object' && typeof p.then === 'function' && typeof p.catch === 'function') {
    return true;
  }

  return false;
}

function isAsyncFunction(p: any): boolean {
  if (typeof p === 'function' && (p.constructor.name === 'AsyncFunction' || isPromise(p()))) {
    return true;
  }
  return false;
}

export function Fill(...asyncFunctions: IQueueFunction[]): Promise<IFillResult[]> {
  for (let i = 0; i < asyncFunctions.length; i += 1) {
    if (!isAsyncFunction(asyncFunctions[i])) {
      throw Error('One of input parameters was not async function');
    }
  }
  return Promise.all(
    asyncFunctions.map((asyncFunc) =>
      asyncFunc().then(
        (result) => ({ success: true, result }),
        (error) => ({ success: false, result: error }),
      ),
    ),
  );
}

/**
 * Apply an async method on a given array
 * @param {T[]} arrayData Array liked data
 * @param {(element: T) => Promise<any>} asyncFunction The function that will be apply for
 * all elements of the given array
 * @returns {any[]}
 */
export function OneForAll<T>(arrayData: T[], asyncFunction: (element: T) => Promise<any>): Promise<any[]> {
  if (!isAsyncFunction(asyncFunction)) {
    throw Error("The given function isn't an async function");
  }
  return Promise.all(arrayData.map((e: T) => asyncFunction(e)));
}

/**
 * It's a race, we're only take the first result.
 * In case, every racer was failed we return last error
 * [[include: utilities-first-001.md]]
 * @export
 * @param {...IQueueFunction[]} asyncFunctions Async function that will be added
 * @return {Promise<any>}
 */
export function First(...asyncFunctions: IQueueFunction[]): Promise<any> {
  for (let i = 0; i < asyncFunctions.length; i += 1) {
    if (!isAsyncFunction(asyncFunctions[i])) {
      throw Error('One of input parameters was not async function');
    }
  }
  const failed = asyncFunctions.map(() => false);
  return new Promise((resolve, reject) => {
    asyncFunctions.forEach((asyncFunc, index: number) => {
      asyncFunc().then(resolve, (error: Error) => {
        failed[index] = true;
        if (failed.every((v) => v === true)) {
          reject(error);
        }
      });
    });
  });
}

/**
 * Sleep for a wait
 * @export
 * @param {number} duration Duration in milliseconds
 * @return {Promise<undefined>}
 */
export function WaitSleep(duration: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/**
 * Try an async function several times till it's successful
 * [[include: utilities-till-success-001.md]]
 * @export
 * @template T Could be any kind of data
 * @param {IQueueFunction} asyncFunction Function need to be retried
 * @param {number} paddingTime=1000 Max number of times, we give it a try
 * @param {number} retries=3
 * @return {Promise<T>}
 */
export async function TillSuccess<T>(
  asyncFunction: IQueueFunction,
  paddingTime: number = 1000,
  retries: number = 3,
): Promise<T> {
  if (!isAsyncFunction(asyncFunction)) {
    throw Error('One of input parameters was not async function');
  }
  let tried = 0;
  let success = false;
  let result: any;
  let foundErr;
  while (tried < retries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      result = await asyncFunction();
      success = true;
      break;
    } catch (err) {
      tried += 1;
      success = false;
      foundErr = err;
    }
    // eslint-disable-next-line no-await-in-loop
    await WaitSleep(paddingTime);
  }
  if (success) {
    return result;
  }
  throw foundErr;
}

export default {
  Fill,
  First,
  TillSuccess,
  WaitSleep,
};
