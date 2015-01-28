'use strict';


var
  mockReporter = require('../testUtils/mockCustomReporter'),
  _ = require('lodash'),
  scenarioo = require('../../lib/scenarioo'),
  assert = require('assert');


describe('global functions', function () {

  describe('#describeUseCase()', function () {

    beforeEach(function () {
      scenarioo.reset();
    });

    it('should register global function "describeUseCase()"', function () {
      assert(_.isFunction(describeUseCase));
    });

    it('should throw if no reporter is registered', function () {
      assert.throws(function () {
        describeUseCase('someDummyUseCase', 'description', function () {

        });
      }, /Please register a reporter by invoking "scenarioo.useReporter/);
    });

    it('should not throw if a reporter is registered', function () {
      scenarioo.useReporter(mockReporter);
      describeUseCase('someDummyUseCase', 'description', function () {

      });
    });

  });

  describe('#describeScenario()', function () {

    beforeEach(function () {
      scenarioo.reset();
    });

    it('should register global function "describeScenario()"', function () {
      assert(_.isFunction(describeScenario));
    });

    it('should throw if no reporter is registered', function () {
      assert.throws(function () {
        describeScenario('someDummyScenario', 'description', function () {

        });
      }, /Please register a reporter by invoking "scenarioo.useReporter/);
    });

  });

});
