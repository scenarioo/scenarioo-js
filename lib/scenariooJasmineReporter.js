var
  util = require('util'),
  path = require('path'),
  store = require('./scenariooStore'),
  docuWriter = require('./docuWriter/docuWriter.js');

/**
 *
 * @param targetDirectory
 * @param branchName
 * @param branchDescription
 * @param buildName
 * @param revision
 * @returns {JasmineReporter} a Reporter instance
 * @constructor
 */
function ScenariooJasmineReporter(targetDirectory, branchName, branchDescription, buildName, revision) {

  store.init(branchName, branchDescription, buildName, revision);

  return {
    jasmineStarted: jasmineStarted,
    suiteStarted: suiteStarted,
    specStarted: specStarted,
    specDone: specDone,
    suiteDone: suiteDone,
    jasmineDone: jasmineDone
  };

  /**
   * is invoked when runner is starting
   */
  function jasmineStarted(runner) {
    var absoluteTargetDir = path.resolve(targetDirectory);
    console.log('Reporting ' + runner.totalSpecsDefined + ' scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
    store.setBuildDate(new Date().toISOString());
    docuWriter.start(store.getBranch(), store.getBuild().name, absoluteTargetDir);
  }

  /**
   * is invoked when a suite is starting (i.e. for every use case)
   * @param suite
   */
  function suiteStarted(suite) {
    if (!store.getCurrentUseCase()) {
      suite.isUseCase = true;
      store.setCurrentUseCase(suite);
      store.updateUseCase(suite.id, {
        passedScenarios: 0,
        failedScenarios: 0,
        skippedScenarios: 0
      });
    }
  }

  /**
   * is invoked when a spec is starting (i.e. for every scenario)
   * @param spec
   */
  function specStarted(spec) {
    store.setCurrentScenario(spec);
    spec._suite = store.getCurrentUseCase();
  }

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    console.log('All done!');

    var build = store.getBuild();
    var status = (build.failedUseCases === 0) ? 'success' : 'failed';

    docuWriter.saveBuild({
      status: status,
      name: build.name,
      date: build.date,
      revision: build.revision
    });

    store.clear();
  }

  /**
   * is invoked at the end of a spec  (i.e. after every scenario)
   */
  function specDone(spec) {

    var useCase = store.getUseCase(spec._suite.id);

    if (spec.status === 'pending') {
      console.log('scenario :: ' + spec.description + ' :: skipped!');
      store.updateUseCase(useCase.id, {
        skippedScenarios: useCase.skippedScenarios + 1
      });
      return;
    }

    var didFail = spec.status === 'failed';
    if (didFail) {
      store.updateUseCase(useCase.id, {
        failedScenarios: useCase.failedScenarios + 1
      });
    } else {
      store.updateUseCase(useCase.id, {
        passedScenarios: useCase.passedScenarios + 1
      });
    }

    console.log('scenario :: ' + spec.description + ' :: ' + (didFail ? 'failed' : 'passed'));
    var currentScenario = {
      name: spec.description,
      description: store.getScenario(spec.description).additionalDescription,
      status: didFail ? 'failed' : 'success'
    };

    docuWriter.saveScenario(currentScenario, spec._suite.description);
  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   * @param suite
   */
  function suiteDone(suite) {
    if (!suite.isUseCase) {
      return;
    }

    store.setCurrentUseCase(undefined);

    var useCaseState = store.getUseCase(suite.id);
    var didFail = useCaseState.failedScenarios > 0;

    var build = store.getBuild();
    if (didFail) {
      store.updateBuild({
        failedUseCases: build.failedUseCases + 1
      });
    } else {
      store.updateBuild({
        passedUseCases: build.passedUseCases + 1
      });
    }

    console.log(util.format('useCase :: %s :: %s (%d passed, %d failed, %d skipped)',
      suite.description,
      didFail ? 'failed' : 'passed',
      useCaseState.passedScenarios,
      useCaseState.failedScenarios,
      useCaseState.skippedScenarios));

    var useCase = {
      name: suite.description,
      description: useCaseState.additionalDescription,
      status: didFail ? 'failed' : 'success'
    };
    docuWriter.saveUseCase(useCase);
  }
}

module.exports = ScenariooJasmineReporter;
