'use strict';


var
  assert = require('assert'),
  sandboxedModule = require('sandboxed-module'),
  _ = require('lodash');


var fakeJasmine = {
  Reporter: function () {
  }
};

describe('scenarioo', function () {

  beforeEach(function () {
    scenarioo.reset();
  });

  var scenarioo = sandboxedModule.require('../../lib/scenarioo', {
    requires: {
      'lodash': _
    },
    globals: {
      jasmine: fakeJasmine
    }
  });

  it('initialize with built in reporter : jasmine', function () {
    scenarioo.useReporter('jasmine');
    assert(scenarioo.getReporter());
  });

  it('initialize with built in reporter : mocha', function () {
    scenarioo.useReporter('mocha');
    assert(scenarioo.getReporter());
  });

  it('initialize with custom reporter', function () {
    var customReporter = {};
    scenarioo.useReporter(customReporter);
    assert.deepEqual(scenarioo.getReporter(), customReporter);
  });

  it('initialize with built in adapter : protractor', function () {
    scenarioo.useAdapter('protractor');
    assert(scenarioo.getAdapter());
  });

  it('initialize with built in adapter : webdriver.io', function () {
    scenarioo.useAdapter('webdriver.io');
    assert(scenarioo.getAdapter());
  });

  it('initialize with custom adapter', function () {
    var customAdapter = {};
    scenarioo.useAdapter(customAdapter);
    assert.deepEqual(scenarioo.getAdapter(), customAdapter);
  });


  describe('#init()', function () {

    it('should throw if options are undefined', function () {
      assert.throws(function () {
        scenarioo.init();
      }, /Please provide valid options/);
    });

    it('should throw if options are invalid', function () {
      assert.throws(function () {
        scenarioo.init({});
      }, /Please provide valid options/);
    });

    it('should throw if no reporter is registered', function () {
      assert.throws(function () {
        scenarioo.init({
          targetDirectory: './somewhereOverTheOcean',
          branch: 'featureBranch123',
          build: 'build_' + new Date(),
          revision: '1.2.0'
        });
      }, /Please register a reporter by invoking "scenarioo.useReporter/);
    });

  });

});
