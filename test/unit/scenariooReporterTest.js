var assert = require('assert');
var store = require('../../lib/scenariooStore');
var reporter = require('../../lib/scenariooReporter');

describe('ScenariooReporter', function () {

  beforeEach(function () {
    this.defaultOptions = {
      targetDirectory: './test/out/docu',
      branchName: 'reporterTest-state-manipulation',
      branchDescription: 'reporterTestBranch',
      buildName: 'reporterTestBuild',
      revision: '0.0.1'
    };
    store.clear();
  });

  afterEach(function () {
    store.clear();
  });

  describe('#runStarted()', function () {
    it('successful', function () {
      reporter.runStarted(this.defaultOptions);
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

    it('fail if already started', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');

      assert.throws(function () {
        reporter.useCaseStarted('uc2');
      }.bind(this), /Cannot start useCase 'uc2', useCase 'uc1' currently running/);
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

    it('fail if already started', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');

      assert.throws(function () {
        reporter.scenarioStarted('sc2');
      }.bind(this), /Cannot start scenario 'sc2', scenario 'sc1' currently running/);
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
      reporter.useCaseStarted('uc1', 'Some UseCase');
      reporter.scenarioStarted('sc1', 'Some Scenario');
      reporter.scenarioEnded('sc1', reporter.SUCCESSFUL);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.passedScenarios, 1);
      assert.equal(store.getCurrentScenario(), undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state failed)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1', 'Some UseCase');
      reporter.scenarioStarted('sc1', 'Some Scenario');
      reporter.scenarioEnded('sc1', reporter.FAILED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.failedScenarios, 1);
      assert.equal(store.getCurrentScenario(), undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state skipped)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1', 'Some UseCase');
      reporter.scenarioStarted('sc1', 'Some Scenario');
      reporter.scenarioEnded('sc1', reporter.SKIPPED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.skippedScenarios, 1);
      assert.equal(store.getCurrentScenario(), undefined, 'currentScenario must be set to undefined');
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

    it('successful (with one successful scenario)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1', 'Some UseCase');
      reporter.scenarioStarted('sc1', 'Some Scenario');
      reporter.scenarioEnded('sc1', reporter.SUCCESSFUL);
      reporter.useCaseEnded('uc1');

      // build must be updated and marked as success
      var build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
      assert.equal(store.getCurrentUseCase(), undefined, 'currentUseCase must be set to undefined');
    });

    it('successful (with one failed scenario)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('uc1', 'Some UseCase');
      reporter.scenarioStarted('sc1', 'Some Scenario');
      reporter.scenarioEnded('sc1', reporter.FAILED);
      reporter.useCaseEnded('uc1');

      // build must be updated and marked as failed
      var build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
      assert.equal(store.getCurrentUseCase(), undefined, 'currentUseCase must be set to undefined');
    });

    // TODO:  can a useCase be skipped completetly?
    //it('successful (with state skipped)', function () {
    //  reporter.runStarted(this.defaultOptions);
    //  reporter.useCaseStarted('uc1');
    //  reporter.useCaseEnded('uc1');
    //
    //  // build must be updated
    //  var build = store.getBuild();
    //  assert.equal(build.skippedUseCases, 1);
    //  assert.equal(store.getCurrentUseCase(), undefined, 'currentUseCase must be set to undefined');
    //});

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
        reporter.useCaseEnded('uc1');
      }.bind(this), /Cannot end useCase, no useCase was started!/);
    });
  });

});
