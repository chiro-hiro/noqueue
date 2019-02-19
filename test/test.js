var assert = require('assert');
var noQueue = require('../index');

describe('noQueue', function () {

  describe('constructor()', function () {

    it('should able to create new instance', function () {
      let error = true;
      try {
        new noQueue({ delay: 1000 });
        error = false;
      } catch (e) {
        error = true;
      }
      assert.equal(error, false);
    });
    
  });

});