
# Not Only Queue

A feature rich queue with event dispatch.

## Installation

```
install i noqueue
```
_Required: Node.JS >= 10.x.x_

## Basic usage of Queue

We are execute functions in the queue one by one, all elements could be added and removed from queue dynamically.

```js
const noQueue = require('noqueue');
var myQueue = new noQueue.Queue();

myQueue
  .add('job-1', async (value) => {
    console.log('Previous result:', value, '| Job 1 done');
    return 'J1';
  })
  .add('job-2', async (value) => {
    console.log('Previous result:', value, '| Job 2 done');
    return 'J2';
  })
  .add('job-3', async (value) => {
    console.log('Previous result:', value, '| Job 3 done');
    if (myQueue.remove('job-3')) {
      console.log('Job 3 was removed');
    }
    return 'J3';
  })
  .start();
```

**Result**

```
Previous result: undefined | Job 1 done
Previous result: J1 | Job 2 done
Previous result: J2 | Job 3 done
Job 3 was removed
Previous result: J3 | Job 1 done
Previous result: J1 | Job 2 done
Previous result: J2 | Job 1 done
Previous result: J1 | Job 2 done
```


## Basic usage of EventDispatcher

Event dispatcher is able to transfer event and its data to listener.

```js
const noQueue = require('noqueue');
var eventHadler = new noQueue.EventDispatcher();

eventHadler
  .on('test', (data) => {
    console.log('on-test', data);
  })
  .once('test', (data) => {
    console.log('once-test', data);
  });

setInterval(() => {
  eventHadler.emit('test', [1, 3, 2]);
}, 1000);
```

**Result**

```
on-test [ 1, 3, 2 ]
once-test [ 1, 3, 2 ]
on-test [ 1, 3, 2 ]
on-test [ 1, 3, 2 ]
on-test [ 1, 3, 2 ]
```

## Advance usage and combination

There are many ways to trigger events and `Queue` is perform failover, our program won't stuck or stop by error.

```js
const noQueue = require('noqueue');
var myQueue = new noQueue.Queue();

myQueue
  .on('error', (err) => {
    console.error('Found error:', err);
  }).on('job-1-done', function (name, data) {
    console.info(name, data);
  }).on('job-2-done', function (name, data) {
    console.info(name, data)
  });

myQueue
  .add('job-1', async () => {
    myQueue.emit('job-1-done', 'Name: Job 1', { data: "job 1 data" });
  })
  .add('job-2', async () => {
    if (Math.floor(Math.random() * 100) % 2 == 0) {
      return {
        name: 'job-2-done',
        data: ['Name: Job 2', { data: "job 2 data" }]
      };
    } else {
      throw new Error('Unexpected error happend');
    }
  })
  .start();
```

**Result**

```
Name: Job 1 { data: 'job 1 data' }
Found error: Error: Unexpected error happend
    at myQueue.add.add (/home/chirohiro/Gits/chiro-hiro/test2.js:24:13)
    at Queue.worker (/home/chirohiro/Gits/chiro-hiro/noqueue/built/queue.js:80:22)
    at Timeout._self.handler.setTimeout [as _onTimeout] (/home/chirohiro/Gits/chiro-hiro/noqueue/built/queue.js:97:34)
    at ontimeout (timers.js:436:11)
    at tryOnTimeout (timers.js:300:5)
    at listOnTimeout (timers.js:263:5)
    at Timer.processTimers (timers.js:223:10)
Name: Job 1 { data: 'job 1 data' }
Name: Job 2 { data: 'job 2 data' }
```

## Run tasks in clusters

```js
const noQueue = require('noqueue');
let clusterService = new noQueue.ClusterService()

clusterService.add('express1', () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Express 1');
      resolve();
    }, 20000);
  });
}, 1000);

clusterService.add('express2', async () => {
  console.log('Express 2');
});

clusterService.on('success', (name) => {
  console.log('Success execute:', name);
}).on('error', (error) => {
  console.log('Got error:', error);
})

clusterService.start();
```

**Result**

```
Express 2
Success execute: express2
Got error: [express1] Child process timeout - Error: Child process timeout
    at Timeout.setTimeout [as _onTimeout] (/home/chirohiro/Gits/chiro-hiro/test/node_modules/noqueue/built/service-cluster.js:84:45)
    at ontimeout (timers.js:436:11)
    at tryOnTimeout (timers.js:300:5)
    at listOnTimeout (timers.js:263:5)
    at Timer.processTimers (timers.js:223:10)
Express 2
Success execute: express2
Express 2
Success execute: express2
Got error: [express1] Child process timeout - Error: Child process timeout
    at Timeout.setTimeout [as _onTimeout] (/home/chirohiro/Gits/chiro-hiro/test/node_modules/noqueue/built/service-cluster.js:84:45)
    at ontimeout (timers.js:436:11)
    at tryOnTimeout (timers.js:300:5)
    at listOnTimeout (timers.js:263:5)
    at Timer.processTimers (timers.js:223:10)
```