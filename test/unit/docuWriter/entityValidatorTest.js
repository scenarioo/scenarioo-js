'use strict';

var
  assert = require('assert'),
  validator = require('../../../lib/docuWriter/entityValidator');

describe('entityValidator', function () {

  describe('#validateBranch()', function () {

    it('should not throw on valid minimal branch', function () {
      validator.validateBranch({
        name: 'Some branch name'
      });
    });

    it('should not throw on valid full branch', function () {
      validator.validateBranch({
        name: 'Some branch name',
        description: 'branch description',
        details: {'some': 'object'}
      });
    });

    it('should throw on invalid branch: missing required properties', function () {
      assert.throws(function () {
        validator.validateBranch({});
      }, /Missing required property: name/);
    });

  });


  describe('#validateBuild()', function () {

    it('should not throw on valid minimal build', function () {
      validator.validateBuild({
        name: 'Some Build name',
        status: 'success',
        date: new Date().toISOString()
      });
    });

    it('should not throw on valid full build', function () {
      validator.validateBuild({
        name: 'Some build name',
        revision: '123',
        date: new Date().toISOString(),
        status: 'success',
        details: {'some': 'object'}
      });
    });

    it('should throw on invalid build: missing required properties', function () {
      assert.throws(function () {
        validator.validateBuild({});
      }, /Missing required property: name .* Missing required property: status .* Missing required property: date/);
    });

    it('should throw on invalid build: status attribute not "failed" or "success"', function () {
      assert.throws(function () {
        validator.validateBuild({
          name: 'Some Build name',
          status: 'someThingElse',
          date: new Date().toISOString()
        });
      }, /String does not match pattern: /);
    });

  });

  describe('#validateUseCase()', function () {

    it('should not throw on valid minimal useCase', function () {
      validator.validateUseCase({
        name: 'Some use case name',
        status: 'success'
      });
    });

    it('should not throw on valid full useCase', function () {
      validator.validateUseCase({
        name: 'Some use case name',
        description: 'some use case description',
        status: 'success',
        details: {'some': 'object'},
        labels: ['one', 'two']
      });
    });

    it('should throw on invalid useCase: missing required properties', function () {
      assert.throws(function () {
        validator.validateUseCase({});
      }, /Missing required property: name .* Missing required property: status/);
    });

    it('should throw on invalid useCase: status attribute not "failed" or "success"', function () {
      assert.throws(function () {
        validator.validateUseCase({
          name: 'Some use case name',
          status: 'not...'
        });
      }, /String does not match pattern: /);
    });

  });

  describe('#validateScenario()', function () {

    it('should not throw on valid minimal scenario', function () {
      validator.validateScenario({
        name: 'Some scenario name',
        status: 'success'
      });
    });

    it('should not throw on valid full scenario', function () {
      validator.validateScenario({
        name: 'Some scemario name',
        description: 'some scenario description',
        status: 'success',
        details: {'some': 'object'},
        labels: ['one', 'two']
      });
    });

    it('should throw on invalid scenario: missing required properties', function () {
      assert.throws(function () {
        validator.validateScenario({});
      }, /Missing required property: name .* Missing required property: status/);
    });

    it('should throw on invalid scenario: status attribute not "failed" or "success"', function () {
      assert.throws(function () {
        validator.validateScenario({
          name: 'Some scenario name',
          status: 'not...'
        });
      }, /String does not match pattern: /);
    });

  });

  describe('#validateStep()', function () {

    it('should not throw on valid minimal step', function () {
      validator.validateStep({});
    });

    it('should not throw on valid full scenario', function () {
      validator.validateStep({
        page: {
          name: 'some page name',
          details: {'some': 'object'},
          labels: ['one', 'two']
        },
        stepDescription: {
          index: 0,
          title: 'stepTitle',
          status: 'failed',
          screenshotFileName: 'someFileName.png',
          details: {'some': 'object'},
          labels: ['one', 'two']
        },
        html: '<html><body>bla</body></html>',
        metadata: {
          visibleText: 'bla',
          details: {'some': 'object'}
        }
      });
    });

    it('should throw on invalid step: invalid page', function () {

      assert.throws(function () {
        validator.validateStep({
          page: {
            // name is missing
            details: 'some',   // must be valid "details"
            labels: 'other'    // must be an array
          }
        });
      }, /Missing required property: name .* Invalid type: string .* Invalid type: string \(expected array\) \(\/page\/labels, \/properties\/page\/properties\/labels\/type\)/);

    });

  });

});
