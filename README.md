
# Not Only Queue

A feature rich queue with event dispatch.

## Installation

```
install i noqueue
```
_Required: Node.JS >= 10.x.x_

## Basic usage

```js
const noQueue = require('noqueue');
var myQueue = new noQueue();

myQueue.on('job-done', (value) => {
  console.log('[EVENT:job-done]', value);
});

myQueue.add('Job 1', async (value) => {
  console.log('Previous result:', value, '| Job 1 done');
  return 'J1';
});

myQueue.add('Job 2', async (value) => {
  console.log('Previous result:', value, '| Job 2 done');
  return 'J2';
});

myQueue.add('Job 3', async (value) => {
  console.log('Previous result:', value, '| Job 3 done');
  return {
    name: 'job-done',
    data: [1, 2, 3]
  };
});

myQueue.add('Job 4', async () => {
  console.log('Job 4 done');
});

myQueue.start();
```

**Result**

```
Previous result: undefined | Job 1 done
Previous result: J1 | Job 2 done
Previous result: J2 | Job 3 done
[EVENT:job-done] [ 1, 2, 3 ]
Job 4 done
Previous result: undefined | Job 1 done
Previous result: J1 | Job 2 done
Previous result: J2 | Job 3 done
[EVENT:job-done] [ 1, 2, 3 ]
Job 4 done
```

## Event dispatch

```js
myQueue.on('job-done', (value)=>{
  console.log(`[EVENT:job-done] ${value}`);
});

myQueue.add('Job 1', async () => {
  myQueue.emit('job-done', 'job 1');
});

myQueue.add('Job 2', async () => {
  myQueue.emit('job-done', 'job 2');
});

myQueue.start();
```

**Result:**

```
[EVENT:job-done] job 1
[EVENT:job-done] job 2
```