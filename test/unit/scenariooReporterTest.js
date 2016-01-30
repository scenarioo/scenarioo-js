var assert = require('assert');
var store = require('../../lib/scenariooStore');
var reporter = require('../../lib/scenariooReporter');

describe.only('ScenariooReporter', function () {

  beforeEach(function () {
    this.defaultOptions = {
      targetDirectory: './test/out/docu',
      branchName: 'reporterTest-state-manipulation',
      branchDescription: 'reporterTestBranch',
      buildName: 'reporterTestBuild',
      revision: '0.0.1'
    };
  });

  afterEach(function () {
    store.clear();
  });

  describe('#runStarted()', function () {

    it('successful', function () {
      reporter.runStarted(this.defaultOptions);
    });

    it('fail on already started', function () {
      reporter.runStarted(this.defaultOptions);

      assert.throws(function () {
        reporter.runStarted();
      }.bind(this), /Run already started/);
    });

  });

  describe('#runEnded()', function () {
    it('successful ended and cleared store', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.runEnded();

      assert(!store.isInitialized());
    });

    it('fail if run not started', function () {
      assert.throws(function () {
        reporter.runEnded();
      }, /Cannot end test run. No test run was started/);
    });

  });

  describe('#useCaseStarted()', function () {

    it('successful', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
    });

    it('fail if id missing', function () {
      reporter.runStarted(this.defaultOptions);
      assert.throws(function () {
        reporter.useCaseStarted();
      }.bind(this), /Please provide a useCaseId/);
    });

    it('fail if run not started', function () {
      assert.throws(function () {
        reporter.useCaseStarted('uc1');
      }.bind(this), /Cannot start useCase, run was not started!/);
    });

  });

  describe('#scenarioStarted()', function () {

    it('successful', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');
    });

    it('fail if id missing', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      assert.throws(function () {
        reporter.scenarioStarted();
      }.bind(this), /Please provide a scenarioId/);
    });

    it('fail if useCase not started', function () {
      reporter.runStarted(this.defaultOptions);

      assert.throws(function () {
        reporter.scenarioStarted('sc1');
      }.bind(this), /Cannot start scenario, useCase was not started!/);
    });

  });

  describe('#scenarioEnded()', function () {

    it('successful (with state successful)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');
      reporter.scenarioEnded('sc1', reporter.SUCCESSFUL);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.passedScenarios, 1);
    });

    it('successful (with state failed)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');
      reporter.scenarioEnded('sc1', reporter.FAILED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.failedScenarios, 1);
    });

    it('successful (with state skipped)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');
      reporter.scenarioEnded('sc1', reporter.SKIPPED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.skippedScenarios, 1);
    });

    it('fail if id is missing', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');

      assert.throws(function () {
        reporter.scenarioEnded();
      }.bind(this), /Please provide a scenarioId/);
    });

    it('fail if id does not match started scenario', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');

      assert.throws(function () {
        reporter.scenarioEnded('sc2');
      }.bind(this), /Cannot end scenario 'sc2', current scenario is 'sc1'/);
    });

    it('fail if scenario not started', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');

      assert.throws(function () {
        reporter.scenarioEnded('sc1', reporter.SUCCESSFUL);
      }.bind(this), /Cannot end scenario, no scenario was started!/);
    });

  });

  describe('#useCaseEnded()', function () {

    it('successful (with state successful)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.useCaseEnded('uc1', reporter.SUCCESSFUL);

      // build  must be updated
      var build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
    });

    it('successful (with state failed)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.useCaseEnded('uc1', reporter.FAILED);

      // build must be updated
      var build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
    });

    it('successful (with state skipped)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.useCaseEnded('uc1', reporter.SKIPPED);

      // build must be updated
      var build = store.getBuild();
      assert.equal(build.skippedUseCases, 1);
    });

    it('fail if id is missing', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');

      assert.throws(function () {
        reporter.useCaseEnded();
      }.bind(this), /Please provide a useCaseId/);
    });

    it('fail if id does not match started UseCase', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');

      assert.throws(function () {
        reporter.useCaseEnded('uc2');
      }.bind(this), /Cannot end useCase 'uc2', current useCase is 'uc1'/);
    });

    it('fail if useCase not started', function () {
      reporter.runStarted(this.defaultOptions);

      assert.throws(function () {
        reporter.useCaseEnded('uc1', reporter.SUCCESSFUL);
      }.bind(this), /Cannot end useCase, no useCase was started!/);
    });
  });

});
