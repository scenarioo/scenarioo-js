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
      reporter.runEnded();

      assert(!store.isInitialized());
    });

    it('fail if run not started', () => {
      assert.throws(() => reporter.runEnded(), /Cannot end test run. No test run was started/);
    });

  });

  describe('#useCaseStarted()', () => {

    it('successful', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('uc1');
    });

    it('fail if run not started', () => {
      assert.throws(() => reporter.useCaseStarted('uc1'), /Cannot start useCase, run was not started!/);
    });

  });

  describe('#scenarioStarted()', () => {
    it('successful', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('uc1');
      reporter.scenarioStarted('sc1');
    });
  });

  describe('#scenarioEnded()', () => {

    it('successful (with state successful)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.SUCCESS);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.passedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state failed)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.FAILED);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.failedScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

    it('successful (with state pending)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.PENDING);

      // parent useCase must be updated
      const useCase = store.getCurrentUseCase();
      assert.equal(useCase.pendingScenarios, 1);
      assert.equal(store.dump().currentScenario, undefined, 'currentScenario must be set to undefined');
    });

  });

  describe('#useCaseEnded()', () => {

    it('successful (with one successful scenario)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.SUCCESS);
      reporter.useCaseEnded();

      // build must be updated and marked as success
      const build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

    it('successful (with one failed scenario)', () => {
      reporter.runStarted(defaultOptions);
      reporter.useCaseStarted('Some UseCase');
      reporter.scenarioStarted('Some Scenario');
      reporter.scenarioEnded(reporter.FAILED);
      reporter.useCaseEnded();

      // build must be updated and marked as failed
      const build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
      assert.equal(store.dump().currentUseCase, undefined, 'currentUseCase must be set to undefined');
    });

    // TODO:  can a useCase be pending completely (in jasmine or other)?
    //it('successful (with state pending)', () => {
    //  reporter.runStarted(defaultOptions);
    //  reporter.useCaseStarted('uc1');
    //  reporter.useCaseEnded('uc1');
    //
    //  // build must be updated
    //  var build = store.getBuild();
    //  assert.equal(build.pendingUseCases, 1);
    //  assert.equal(store.getCurrentUseCase(), undefined, 'currentUseCase must be set to undefined');
    //});

  });

});
