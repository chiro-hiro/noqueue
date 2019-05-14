var assert = require('assert');
var noQueue = require('../index');
var instance = null;
var testQueueResult = [];
var testEventResult = [];

describe('noQueue', () => {

  describe('.constructor()', () => {

    it('should able to create new instance', () => {
      instance = new noQueue({ delay: 1000 });
      assert.notEqual(instance, null);
    });

  });

  describe('.add() .remove()', () => {

    it('should able to .add() new job to queue', () => {
      instance.add('test-queue-1', async (value) => {
        console.log(value);
      });
      assert.equal(instance.order.indexOf('test-queue-1') >= 0, true);
      assert.equal(typeof (instance.queue['test-queue-1']), 'function');
    });

    it('should able to .remove() job from queue', () => {
      instance.remove('test-queue-1');
      assert.equal(instance.order.indexOf('test-queue-1') >= 0, false);
      assert.equal(typeof (instance.queue['test-queue-1']), 'undefined');
    });

  });

  describe('.start() .stop()', () => {

    it('should able to .start() queue', async () => {
      testQueueResult[0] = 0;
      instance.add('test-queue-2', async () => {
        testQueueResult[0]++;
      });
      instance.start();
      await (new Promise((resolve, reject) => {
        setTimeout(resolve(true), 2000);
      }));
      assert.equal(testQueueResult > 0, true);
      assert.notEqual(instance.handler, null)
      assert.equal(instance.order.indexOf('test-queue-2') >= 0, true);
      assert.equal(typeof (instance.queue['test-queue-2']), 'function');
    });

    it('should able to .stop() queue', async () => {
      instance.stop();
      await (new Promise((resolve, reject) => {
        setTimeout(resolve(true), 2000);
      }));
      assert.equal(instance.handler, null)
    });

  });

  describe('.on() .once() .emit()', () => {

    it('should able to listent event with .on() and .once()', () => {
      testEventResult[0] = 0;
      testEventResult[1] = 0;
      instance.on('test-event-2', () => {
        testEventResult[0]++;
      });
      instance.once('test-event-2', () => {
        testEventResult[1]++;
      });
      assert.equal(typeof instance.events['test-event-2'], 'object')
      assert.equal(typeof instance.events['___once_event___test-event-2'], 'object')
    });

    it('should able to emit events', async () => {
      instance.emit('test-event-2');
      instance.emit('test-event-2');
      await (new Promise((resolve, reject) => {
        setTimeout(resolve(true), 2000);
      }));
      assert(testEventResult[0], 2);
      assert(testEventResult[1], 1);
    });

  });

});