### .Fill() Guide

We will use this code to simulate an heavy task:

```ts
/**
 * We simulate a heavy task
 * @template T
 * @param {T} i
 * @return {*}  {Promise<T>}
 */
async function heavyTask<T>(i: T): Promise<T> {
  const r = 1 + Math.round(Math.random() * 9);
  // Sleep for a random duration
  await Utilities.WaitSleep(r * 500);
  if (r % 2 === 0) {
    return i;
  }
  // Throw error if r is odd
  throw new Error('Unexpected result');
}
```

[[Utilities.Fill]] will be used to perform many tasks at the same time but you can't sure about its result.

```ts
import { Utilities } from './src/index';

(async () => {
  let result = await Utilities.Fill(
    async () => {
      return heavyTask('First');
    },
    async () => {
      return heavyTask('Second');
    },
    async () => {
      return heavyTask('Third');
    },
  );

  console.log(result);
})();
```

Result:

```text
[ { success: true, result: 'First' },
  { success: false,
    result:
     Error: Unexpected result
         at sleepRandom (/home/chiro/gits/chiro-hiro/noqueue/test1.ts:9:9) },
  { success: true, result: 'Third' } ]
```

Results of all given functions will be appeared after all promises are fulfilled.
