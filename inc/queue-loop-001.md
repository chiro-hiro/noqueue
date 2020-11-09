## Introduction

[[QueueLoop]] allowed you do jobs by sequence and repeat them just one by one till the loop was stopped by invoke [[QueueLoop.stop]]

### Example code

We add three jobs to the queue and start processing.

```ts
import { QueueLoop, TimeDuration } from 'noqueue';

const iQueueLoop = new QueueLoop();

iQueueLoop
  .add(
    'job-1',
    async () => {
      return ['job-1-result'];
    },
    TimeDuration.fromSecond(2), // After job-1 is done, wait for 2 seconds
  )
  .add(
    'job-2',
    async (job1Result: string) => {
      console.log('Processing job-1 with input params:', { job1Result });
    },
    TimeDuration.fromSecond(10), // After job-1 is done, wait for 10 seconds
  )
  .add(
    'job-3',
    async () => {
      throw new Error('This an annoying error');
    },
    TimeDuration.fromSecond(2), // After job-3 is done, wait for 2 seconds
  );

// Listen on success event
iQueueLoop.on('success', (eventName, ...params: any[]) => {
  console.log(`Event ${eventName} completed with result:`, params);
});

// Listen on error event
iQueueLoop.on('error', (eventName, error) => {
  console.log(`Event ${eventName} failed with error:`, error);
});

iQueueLoop.start();
```

Here is the result:

```text
Event job-1 completed with result: [ 'job-1-result' ]
Processing job-1 with input params: { job1Result: 'job-1-result' }
Event job-2 completed with result: [ undefined ]
Event job-3 failed with error: Error: This an annoying error
    at testQueue.add.add.add (/home/user/gits/noqueue/test4.ts:23:13)
    at QueueLoop.worker (/home/user/gits/noqueue/src/queue-loop.ts:195:5)
    at Timeout.handler.setTimeout [as _onTimeout] (/home/user/gits/noqueue/src/queue-loop.ts:210:20)
    at ontimeout (timers.js:436:11)
    at tryOnTimeout (timers.js:300:5)
    at listOnTimeout (timers.js:263:5)
    at Timer.processTimers (timers.js:223:10)
```

Even there are an error, it won't break the loop. [[QueueLoop]] is just keep moving on.
