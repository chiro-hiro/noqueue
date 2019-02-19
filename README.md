
# Not Only Queue

A feature rich queue with event dispatch.

```js
var myQueue = new noQueue({ delay: 1000 });

myQueue.on('logme', function (date) {
  console.log('logme', date);
})

myQueue.add('test1', function () {
  console.log('Test 1');
  return new Promise((resolve) => {
    resolve({
      name: 'logme',
      data: (new Date()).toString()
    });
  });
});

myQueue.add('test2', function () {
  console.log('Test 2');
  return new Promise((resolve) => { resolve(true); });
});

myQueue.add('test3', function () {
  console.log('Test 3');
  myQueue.remove('test2');
  return new Promise(function (resolve, reject) {
    let delay = ((Math.random() * 10000) | 0);
    if (delay > 5000) {
      setTimeout(() => {
        resolve(true);
      }, delay);
    } else {
      reject(new Error('My error'));
    }
  });
});

myQueue.start();
```