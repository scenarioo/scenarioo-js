var
  assert = require('assert'),
  _ = require('lodash'),
  store = require('../../src/scenariooStore'),
  reporter = require('../../src/scenariooReporter');

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
    it('with custom pageNameExtractor', function () {
      reporter.runStarted(_.merge({}, this.defaultOptions, {
        pageNameExtractor: function custom() {
        }
      }));
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
  });

  describe('#scenarioEnded()', function () {

    it('successful (with state successful)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.SUCCESS);

      // parent useCase must be updated
      var useCase = store.getCurrentUseCase();
      assert.equal(useCase.passedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state failed)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.FAILED);

      // parent useCase must be updated
      var useCase = store.getCurrentUseCase();
      assert.equal(useCase.failedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state skipped)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.SKIPPED);

      // parent useCase must be updated
      var useCase = store.getCurrentUseCase();
      assert.equal(useCase.skippedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

  });

  describe('#useCaseEnded()', function () {

    it('successful (with one successful scenario)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.SUCCESS);
      reporter.useCaseEnded();

      // build must be updated and marked as success
      var build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

    it('successful (with one failed scenario)', function () {
      reporter.runStarted(this.defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.FAILED);
      reporter.useCaseEnded();

      // build must be updated and marked as failed
      var build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

    // TODO:  can a useCase be skipped completely (in jasmine or other)?
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

  });

});
