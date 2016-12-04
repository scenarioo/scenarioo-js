import assert from 'assert';
import _ from 'lodash';
import reporter from '../../src/scenariooReporter';
import store from '../../src/scenariooStore';

describe('ScenariooReporter', () => {

  let defaultOptions;

  beforeEach(function initStore() {
    defaultOptions = {
      targetDirectory: './test/out/docu',
      branchName: 'reporterTest-state-manipulation',
      branchDescription: 'reporterTestBranch',
      buildName: 'reporterTestBuild',
      revision: '0.0.1'
    };
    store.clear();
  });

  afterEach(() => {
    store.clear();
  });

  describe('#runStarted()', () => {
    it('successful', () => reporter.runStarted(defaultOptions));
    it('with custom pageNameExtractor', () => {
      reporter.runStarted(_.merge({}, defaultOptions, {
        pageNameExtractor: function custom() {
        }
      }));
    });
  });

  describe('#runEnded()', () => {
    it('successful ended and cleared store', () => {
      reporter.runStarted(defaultOptions);
      reporter.runEnded(defaultOptions);

      assert(!store.isInitialized());
    });

    it('fail if run not started', () => {
      assert.throws(() => reporter.runEnded(defaultOptions), /Cannot end test run. No test run was started/);
    });

  });

  describe('#useCaseStarted()', () => {

    it('successful', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'uc1');
    });

    it('fail if run not started', () => {
      assert.throws(() => reporter.useCaseStarted(defaultOptions, 'uc1'), /Cannot start useCase, run was not started!/);
    });

  });

  describe('#scenarioStarted()', () => {
    it('successful', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'uc1');
      reporter.scenarioStarted(defaultOptions, 'sc1');
    });
  });

  describe('#scenarioEnded()', () => {

    it('successful (with state successful)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'Some UseCase');
      reporter.scenarioStarted(defaultOptions, 'Some Scenario');
      reporter.scenarioEnded(defaultOptions, reporter.SUCCESS);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.passedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state failed)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'Some UseCase');
      reporter.scenarioStarted(defaultOptions, 'Some Scenario');
      reporter.scenarioEnded(defaultOptions, reporter.FAILED);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.failedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state pending)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'Some UseCase');
      reporter.scenarioStarted(defaultOptions, 'Some Scenario');
      reporter.scenarioEnded(defaultOptions, reporter.PENDING);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.pendingScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

  });

  describe('#useCaseEnded()', () => {

    it('successful (with one successful scenario)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'Some UseCase');
      reporter.scenarioStarted(defaultOptions, 'Some Scenario');
      reporter.scenarioEnded(defaultOptions, reporter.SUCCESS);
      reporter.useCaseEnded(defaultOptions);

      // build must be updated and marked as success
      const build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

    it('successful (with one failed scenario)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted(defaultOptions, 'Some UseCase');
      reporter.scenarioStarted(defaultOptions, 'Some Scenario');
      reporter.scenarioEnded(defaultOptions, reporter.FAILED);
      reporter.useCaseEnded(defaultOptions);

      // build must be updated and marked as failed
      const build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

  });

});
