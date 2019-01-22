```js
var q = new noQueue({ delay: 1000 });

q.on('logme', function (date) {
  console.log('logme', date);
})

q.add('test1', function () {
  console.log('Test 1');
  return new Promise((resolve) => {
    resolve({
      eventName: 'logme',
      data: [(new Date()).toString()]
    });
  });
});

q.add('test2', function () {
  console.log('Test 2');
  return new Promise((resolve) => { resolve(true); });
});

q.add('test3', function () {
  console.log('Test 3');
  q.remove('test2');
  return new Promise(function (resolve, reject) {
    let delay = ((Math.random() * 10000) | 0);
    if (delay > 5000) {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    } else {
      reject(new Error('My error'));
    }
  });
});

q.start();
```