var
  store = require('../scenariooStore'),
  scenariooReporter = require('../scenariooReporter');

/**
 * This is the jasmine reporter that is registered in your protractor config.
 * (Currently we support only jasmine as a testing framework. We plan to implement more reporters for other frameworks - e.g "mocha".)
 *
 * This reporter implements the jasmine lifecycle hooks and invokes our base reporter (scenariooReporter).
 * It should not invoke docuWriter directly.
 *
 * @param {object} options Options Object with the following properties: "targetDirectory", "branchName", "branchDescription", "buildName" and "revision"
 * @returns {JasmineReporter} a Reporter instance
 */
function ScenariooJasmineReporter(options) {

  store.init(options);

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
  function jasmineStarted() {
    scenariooReporter.runStarted(options);
  }

  /**
   * is invoked when a suite is starting (i.e. for every use case)
   * @param suite
   */
  function suiteStarted(suite) {
    if (!store.getCurrentUseCase()) {
      suite.isUseCase = true;
      scenariooReporter.useCaseStarted(suite.id, suite.description);
    }
  }

  /**
   * is invoked when a spec is starting (i.e. for every scenario)
   * @param spec
   */
  function specStarted(spec) {
    spec._suite = store.getCurrentUseCase();
    // we have to expose the current spec (scenario) id, in order to save additional information to the store,
    // see scenarioo dsl "describeScenario". Better solution is welcome!
    jasmine.currentScenarioId = spec.id;

    scenariooReporter.scenarioStarted(spec.id, spec.description);
  }

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    scenariooReporter.runEnded();
  }

  /**
   * is invoked at the end of a spec  (i.e. after every scenario)
   */
  function specDone(spec) {
    if (spec.failedExpectations) {
      spec.failedExpectations.forEach(function (fail) {
        console.error(fail.message + '\n' + fail.stack);
      });
    }

    scenariooReporter.scenarioEnded(spec.id, jasmineStatusToScenariooStatus(spec.status));
  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   * @param suite
   */
  function suiteDone(suite) {
    scenariooReporter.useCaseEnded(suite.id);
  }
}


function jasmineStatusToScenariooStatus(jasmineStatus) {

  if (!jasmineStatus) {
    throw new Error('Cannot map undefined jasmineStatus to a scenarioo status!');
  }

  var map = {
    pending: scenariooReporter.SKIPPED,
    disabled: scenariooReporter.SKIPPED,
    passed: scenariooReporter.SUCCESSFUL,
    failed: scenariooReporter.FAILED
  };
  var mapped = map[jasmineStatus];
  if (!mapped) {
    throw new Error('Cannot map ' + jasmineStatus + ' to a scenarioo status!');
  }
  return mapped;
}

module.exports = ScenariooJasmineReporter;
