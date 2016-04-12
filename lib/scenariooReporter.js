'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _scenariooStore = require('./scenariooStore');

var _scenariooStore2 = _interopRequireDefault(_scenariooStore);

var _docuWriter = require('./docuWriter/docuWriter');

var _docuWriter2 = _interopRequireDefault(_docuWriter);

var _scenariooJs = require('./scenarioo-js');

var _scenariooJs2 = _interopRequireDefault(_scenariooJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SUCCESS = 'success';
var FAILED = 'failed';
var SKIPPED = 'skipped';

/**
 * This is the base reporter that pulls information from the store and the calling (framework-dependant) reporter
 * and invokes docuWriter in order to create the scenarioo documentation.
 *
 * This base reporter is testing-framework agnostic!
 *
 * @namespace scenariooReporter
 */
exports.default = {
  runStarted: runStarted,
  runEnded: runEnded,

  useCaseStarted: useCaseStarted,
  useCaseEnded: useCaseEnded,

  scenarioStarted: scenarioStarted,
  scenarioEnded: scenarioEnded,

  expectationFailed: expectationFailed,

  /** @constant {string} scenariooReporter#SUCCESS*/
  SUCCESS: SUCCESS,
  /** @constant {string} scenariooReporter#FAILED*/
  FAILED: FAILED,
  /** @constant {string} scenariooReporter#SKIPPED*/
  SKIPPED: SKIPPED
};

/**
 * @func scenariooReporter#runStarted
 * @param {object} options
 */

function runStarted(options) {
  // some reporters (jasmine) need to initialize the store even before the run starts
  // so at this point here, the store might already be set up and good to go.
  if (!_scenariooStore2.default.isInitialized()) {
    _scenariooStore2.default.init(options);
  }

  if (options.pageNameExtractor) {
    _docuWriter2.default.registerPageNameFunction(options.pageNameExtractor);
  }

  _scenariooStore2.default.setBuildDate(new Date());
  var absoluteTargetDir = _path2.default.resolve(options.targetDirectory);
  _docuWriter2.default.start(_scenariooStore2.default.getBranch(), _scenariooStore2.default.getBuild().name, absoluteTargetDir, options);
  console.log('Reporting scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
}

/**
 * @func scenariooReporter#runEnded
 */
function runEnded() {
  if (!_scenariooStore2.default.isInitialized()) {
    throw new Error('Cannot end test run. No test run was started');
  }

  var build = _scenariooStore2.default.getBuild();
  var status = build.failedUseCases === 0 ? 'success' : 'failed';

  _docuWriter2.default.saveBuild({
    status: status,
    name: build.name,
    date: build.date,
    revision: build.revision
  });

  _scenariooStore2.default.clear();

  console.log('All done!');
}

/**
 * @func scenariooReporter#useCaseStarted
 * @param {string} useCaseName
 */
function useCaseStarted(useCaseName) {
  if (!_scenariooStore2.default.isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }
  _scenariooStore2.default.updateCurrentUseCase({
    passedScenarios: 0,
    failedScenarios: 0,
    skippedScenarios: 0,
    name: useCaseName
  });
}

/**
 * @func scenariooReporter#useCaseEnded
 */
function useCaseEnded() {
  var useCase = _scenariooStore2.default.getCurrentUseCase();
  var build = _scenariooStore2.default.getBuild();

  var hasFailingScenarios = useCase.failedScenarios > 0;
  var hasPassedScenarios = useCase.passedScenarios > 0;
  var hasSkippedScenarios = useCase.skippedScenarios > 0;
  var useCaseStatus = void 0;
  if (hasFailingScenarios) {
    _scenariooStore2.default.updateBuild({
      failedUseCases: build.failedUseCases + 1
    });
    useCaseStatus = FAILED;
  } else if (hasPassedScenarios) {
    _scenariooStore2.default.updateBuild({
      passedUseCases: build.passedUseCases + 1
    });
    useCaseStatus = SUCCESS;
  } else if (hasSkippedScenarios) {
    _scenariooStore2.default.updateBuild({
      skippedUseCases: build.skippedUseCases + 1
    });
    useCaseStatus = SKIPPED;
  }

  console.log('useCase :: ' + useCase.name + ' :: ' + translateStatusForLogMessages(useCaseStatus) + ' (' + useCase.passedScenarios + ' passed, ' + useCase.failedScenarios + ' failed, ' + useCase.skippedScenarios + ' skipped)');

  _docuWriter2.default.saveUseCase((0, _merge2.default)({
    status: useCaseStatus
  }, useCase));

  _scenariooStore2.default.resetCurrentUseCase();
}

/**
 * @func scenariooReporter#scenarioStarted
 * @param {string} scenarioName
 */
function scenarioStarted(scenarioName) {
  _scenariooStore2.default.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName,
    status: undefined
  });
}

function expectationFailed(options, failureMessage) {
  _scenariooStore2.default.updateCurrentScenario({ status: 'failed' }); // remember early that it failed allready
  if (options.reportStepOnExpectationFailed) {
    _scenariooJs2.default.saveStep('Failed: ' + failureMessage, { status: 'failed', labels: ['failed'] });
  }
}

/**
 * @func scenariooReporter#scenarioEnded
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#SKIPPED}
 */
function scenarioEnded(status) {
  var scenario = _scenariooStore2.default.getCurrentScenario();
  var useCase = _scenariooStore2.default.getCurrentUseCase();

  switch (status) {
    case SUCCESS:
      _scenariooStore2.default.updateCurrentUseCase({
        passedScenarios: useCase.passedScenarios + 1
      });
      break;
    case FAILED:
      _scenariooStore2.default.updateCurrentUseCase({
        failedScenarios: useCase.failedScenarios + 1
      });
      break;
    case SKIPPED:
      _scenariooStore2.default.updateCurrentUseCase({
        skippedScenarios: useCase.skippedScenarios + 1
      });
      break;
    default:
      throw new Error('Unknown status ' + status);
  }

  console.log('scenario :: ' + scenario.name + ' :: ' + translateStatusForLogMessages(status));

  _docuWriter2.default.saveScenario((0, _merge2.default)({
    status: status
  }, scenario), useCase.name);

  _scenariooStore2.default.resetCurrentScenario();
}

function translateStatusForLogMessages(status) {
  if (!status) {
    return 'n/a';
  }

  var map = {};
  map[SUCCESS] = 'suceeded';
  map[FAILED] = 'failed';
  map[SKIPPED] = 'skipped';
  var mapped = map[status];
  if (!mapped) {
    return 'n/a';
  }
  return mapped;
}