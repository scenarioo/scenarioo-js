import store from  '../scenariooStore';
import scenariooReporter from '../scenariooReporter';

/**
 * This is the jasmine reporter that is registered in your protractor config.
 * (Currently we support only jasmine as a testing framework. We plan to implement more reporters for other frameworks - e.g "mocha".)
 *
 * This reporter implements the jasmine lifecycle hooks and invokes our base reporter (scenariooReporter).
 * It should not invoke docuWriter directly.
 *
 * @ignore
 * @param {object} options Options Object with the following properties: "targetDirectory", "branchName", "branchDescription", "buildName" and "revision" and some more (see examples!)
 * @returns {JasmineReporter} a Reporter instance
 */
function ScenariooJasmineReporter(jasmine, options) {

  store.init(options);
  registerExpectationResultHandlerToReportExpectationFailures();

  return {
    jasmineStarted,
    suiteStarted,
    specStarted,
    specDone,
    suiteDone,
    jasmineDone
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
    scenariooReporter.useCaseStarted(suite.description);
  }

  /**
   * is invoked when a spec is starting (i.e. for every scenario)
   * @param spec
   */
  function specStarted(spec) {
    scenariooReporter.scenarioStarted(spec.description);
  }

  function registerExpectationResultHandlerToReportExpectationFailures() {
    var _addExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = function(passed, expectation) {
      try {
        reportExpectationResult(passed, expectation);
      } catch(e) {
        console.error('Failed to report expectation result in scenarioo: ' + e.message + ' on  expectation: ' + JSON.stringify(expectation));
        if (passed) {
          // propagate failure due to scenarioo reporter when expectation was passed.
          passed = false;
          expectation.passed = false;
          expectation.message = 'Error on reporting passed expectation result in scenarioo: ' + e.message;
        }
      }
      return _addExpectationResult.call(this, passed, expectation);
    };
  }

  /**
   * Is invoked when expectation is passed or failed, to remember if a scenario has failed,
   * which is needed to report last step with failure status (in afterEach),
   * because specDone is too late to report a failure step with scenarioo saveStep.
   * @param passed
   * @param expectation
     */
  function reportExpectationResult(passed, expectation) {
    if (!passed) {
      scenariooReporter.expectationFailed(options, expectation.message);
    }
  }

  /**
   * is invoked at the end of a spec  (i.e. after every scenario)
   */
  function specDone(spec) {

    // TODO #17 log all failures on the scenario also (as text only)
    if (spec.failedExpectations) {
      spec.failedExpectations.forEach(fail=> {
        console.error(`${fail.message}\n${fail.stack}`);
      });
    }

    scenariooReporter.scenarioEnded(jasmineStatusToScenariooStatus(spec.status));
  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   */
  function suiteDone() {
    scenariooReporter.useCaseEnded();
  }

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    scenariooReporter.runEnded();
  }

}


function jasmineStatusToScenariooStatus(jasmineStatus) {

  if (!jasmineStatus) {
    throw new Error('Cannot map undefined jasmineStatus to a scenarioo status!');
  }

  var map = {
    pending: scenariooReporter.SKIPPED,
    disabled: scenariooReporter.SKIPPED,
    passed: scenariooReporter.SUCCESS,
    failed: scenariooReporter.FAILED
  };
  var mapped = map[jasmineStatus];
  if (!mapped) {
    throw new Error(`Cannot map ${jasmineStatus} to a scenarioo status!`);
  }
  return mapped;
}

export default ScenariooJasmineReporter;
