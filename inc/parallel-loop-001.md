## Introduction

[[ParallelLoop]] allowed you to trigger all jobs separately, It guarantees that, the same job won't be trigger twice but different jobs will be happened at the same time.

## Example code

```ts
import { TimeDuration, ParallelLoop } from 'noqueue';

const iParallelLoop = new ParallelLoop();

iParallelLoop
  .add(
    'job-1',
    async () => {
      return 'job-1-result';
    },
    TimeDuration.fromSecond(5),
  )
  .add(
    'job-2',
    async () => {
      return 'job-2-result';
    },
    TimeDuration.fromSecond(1),
  );

iParallelLoop.on('success', (eventName, ...params: any[]) => {
  console.log(`Event ${eventName} completed with result:`, params);
});

iParallelLoop.on('error', (eventName, error) => {
  console.log(`Event ${eventName} failed with error:`, error);
});

iParallelLoop.start();
```

Result:

```text
Event job-2 completed with result: [ 'job-2-result' ]
Event job-2 completed with result: [ 'job-2-result' ]
Event job-2 completed with result: [ 'job-2-result' ]
Event job-2 completed with result: [ 'job-2-result' ]
Event job-1 completed with result: [ 'job-1-result' ]
```

As you see, padding time between `job-2` is 5 seconds that's why `job-1` will be triggered after 5 times of `job-2`.
