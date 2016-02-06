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
 * @param {object} options Options Object with the following properties: "targetDirectory", "branchName", "branchDescription", "buildName" and "revision"
 * @returns {JasmineReporter} a Reporter instance
 */
function ScenariooJasmineReporter(options) {

  _scenariooStore2.default.init(options);

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

  /**
   * is invoked when all tests are done (at the end of all use cases)
   */
  function jasmineDone() {
    _scenariooReporter2.default.runEnded();
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

    _scenariooReporter2.default.scenarioEnded(jasmineStatusToScenariooStatus(spec.status));
  }

  /**
   * is invoked when a suite is done (i.e. after every use case)
   */
  function suiteDone() {
    _scenariooReporter2.default.useCaseEnded();
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