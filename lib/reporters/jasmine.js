'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _scenariooStore = require('../scenariooStore');

var _scenariooStore2 = _interopRequireDefault(_scenariooStore);

var _scenariooReporter = require('../scenariooReporter');

var _scenariooReporter2 = _interopRequireDefault(_scenariooReporter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  _scenariooStore2.default.init(options);
  registerExpectationResultHandlerToReportExpectationFailures();

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
    _scenariooReporter2.default.runStarted(options);
  }

  /**
   * is invoked when a suite is starting (i.e. for every use case)
   * @param suite
   */
  function suiteStarted(suite) {
    _scenariooReporter2.default.useCaseStarted(suite.description);
  }

  /**
   * is invoked when a spec is starting (i.e. for every scenario)
   * @param spec
   */
  function specStarted(spec) {
    _scenariooReporter2.default.scenarioStarted(spec.description);
  }

  function registerExpectationResultHandlerToReportExpectationFailures() {
    var _addExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = function (passed, expectation) {
      try {
        reportExpectationResult(passed, expectation);
      } catch (e) {
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
      _scenariooReporter2.default.expectationFailed(options, expectation.message);
    }
  }

  /**
   * is invoked at the end of a spec  (i.e. after every scenario)
   */
  function specDone(spec) {

    // TODO #17 log all failures on the scenario also (as text only)
    if (spec.failedExpectations) {
      spec.failedExpectations.forEach(function (fail) {
        console.error(fail.message + '\n' + fail.stack);
      });
    }

    _scenariooReporter2.default.scenarioEnded(jasmineStatusToScenariooStatus(spec.status));
  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   */
  function suiteDone() {
    _scenariooReporter2.default.useCaseEnded();
  }

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    _scenariooReporter2.default.runEnded();
  }
}

function jasmineStatusToScenariooStatus(jasmineStatus) {

  if (!jasmineStatus) {
    throw new Error('Cannot map undefined jasmineStatus to a scenarioo status!');
  }

  var map = {
    pending: _scenariooReporter2.default.SKIPPED,
    disabled: _scenariooReporter2.default.SKIPPED,
    passed: _scenariooReporter2.default.SUCCESS,
    failed: _scenariooReporter2.default.FAILED
  };
  var mapped = map[jasmineStatus];
  if (!mapped) {
    throw new Error('Cannot map ' + jasmineStatus + ' to a scenarioo status!');
  }
  return mapped;
}

exports.default = ScenariooJasmineReporter;