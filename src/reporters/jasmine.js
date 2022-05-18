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
 * @param jasmine
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
    scenariooReporter.useCaseStarted(options, suite.description);
  }

  /**
   * is invoked when a spec is starting (i.e. for every scenario)
   * @param spec
   */
  function specStarted(spec) {
    scenariooReporter.scenarioStarted(options, spec.description);
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

    scenariooReporter.scenarioEnded(options, jasmineStatusToScenariooStatus(spec.status));

    // log details about failures after reporting general status for spec.
    if (spec.failedExpectations) {
      if (!options.disableScenariooLogOutput) {
        spec.failedExpectations.forEach(fail=> {
          // leading line break is important to ensure we start on a new line (jasmine output could be inbetween that is single lined)
          console.error(`\n${fail.message}\n${fail.stack}`);
        });
      }
    }

  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   */
  function suiteDone() {
    scenariooReporter.useCaseEnded(options);
  }

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    return scenariooReporter.runEnded(options);
  }

}


function jasmineStatusToScenariooStatus(jasmineStatus) {

  if (!jasmineStatus) {
    throw new Error('Cannot map undefined jasmineStatus to a scenarioo status!');
  }

  var map = {
    passed: scenariooReporter.SUCCESS,
    failed: scenariooReporter.FAILED
  };
  var mapped = map[jasmineStatus];
  if (!mapped) {
    // all other statuses are not mapped and just passed as is
    return jasmineStatus;
  }
  return mapped;
}

export default ScenariooJasmineReporter;
