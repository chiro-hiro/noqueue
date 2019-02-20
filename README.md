
# Not Only Queue

A feature rich queue with event dispatch.

## Installation

```
install i -g noqueue
```
_Required: Node.JS >= 10.x.x_

## Basic usage

```js
const noQueue = require('noqueue');
var myQueue = new noQueue();
```

### Queue example

Create a queue to execute by ordering.

```js
myQueue.add('Job 1', function () {
  return new Promise((resolve, reject) => {
    try{
      console.log('Job 1 done');
      resolve();
    }catch(error){
      reject(error);
    }
  });
});

myQueue.add('Job 2', function () {
  return new Promise((resolve, reject) => {
    try{
      console.log('Job 2 done');
      resolve();
    }catch(error){
      reject(error);
    }
  });
});

myQueue.start();
```

**Result**

```
Job 1 done
Job 2 done
Job 1 done
Job 2 done
```

## Event dispatch

```js
myQueue.on('job-done', (value)=>{
  console.log(`[event:job-done] ${value}`);
});

myQueue.add('Job 1', function () {
  return new Promise((resolve, reject) => {
    try{
      console.log('Job 1 done');
      myQueue.emit('job-done', 'job 1');
      resolve();
    }catch(error){
      reject(error);
    }
  });
});

myQueue.add('Job 2', function () {
  return new Promise((resolve, reject) => {
    try{
      console.log('Job 2 done');
      myQueue.emit('job-done', 'job 2');
      resolve();
    }catch(error){
      reject(error);
    }
  });
});

myQueue.start();
```

**Result:**

```
Job 1 done
[event:job-done] job 1
Job 2 done
[event:job-done] job 2
Job 1 done
[event:job-done] job 1
Job 2 done
[event:job-done] job 2
Job 1 done
[event:job-done] job 1
```