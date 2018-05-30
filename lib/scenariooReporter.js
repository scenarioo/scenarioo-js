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

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SUCCESS = 'success';
var FAILED = 'failed';
var PENDING = 'pending';
var DISABLED = 'disabled';

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
  /** @constant {string} scenariooReporter#PENDING*/
  PENDING: PENDING
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
  if (!options.disableScenariooLogOutput) {
    console.log('Reporting scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
  }
}

/**
 * @func scenariooReporter#runEnded
 * @param {object} options
 */
function runEnded(options) {
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
  if (!options.disableScenariooLogOutput) {
    console.log('All done!');
  }
}

/**
 * @func scenariooReporter#useCaseStarted
 * @param {object} options
 * @param {string} useCaseName
 */
function useCaseStarted(options, useCaseName) {
  if (!_scenariooStore2.default.isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }
  _scenariooStore2.default.updateCurrentUseCase({
    passedScenarios: 0,
    failedScenarios: 0,
    pendingScenarios: 0,
    disabledScenarios: 0,
    name: useCaseName
  });
}

/**
 * @func scenariooReporter#useCaseEnded
 * @param {object} options
 */
function useCaseEnded(options) {

  var useCase = _scenariooStore2.default.getCurrentUseCase();
  var build = _scenariooStore2.default.getBuild();

  var hasFailingScenarios = useCase.failedScenarios > 0;
  var hasPassedScenarios = useCase.passedScenarios > 0;
  var hasPendingScenarios = useCase.pendingScenarios > 0;
  var hasDisabledScenarios = useCase.disabledScenarios > 0;
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
  } else if (hasPendingScenarios) {
    _scenariooStore2.default.updateBuild({
      pendingUseCases: build.pendingUseCases + 1
    });
    useCaseStatus = PENDING;
  } else if (hasDisabledScenarios) {
    // only disabled scenarios ---> do not report whole use case (consider it as disabled as a whole)
    return;
  } else {
    // Use case without any scenarios is considered an empty scenario with status SUCCESS.
    // (probably we can not distinguish between disabled and empty use case here, therefore we just report it as SUCCESS)
    _scenariooStore2.default.updateBuild({
      passedUseCases: build.passedUseCases + 1
    });
    useCaseStatus = SUCCESS;
  }

  if (!options.disableScenariooLogOutput) {
    // starting this log with a new line, because of jasmines ./F/*-Log-Entries inbetween, that do not have line breaks.
    console.log('\n' + useCaseStatus.toUpperCase() + ' use case "' + useCase.name + '": ' + useCase.passedScenarios + ' passed, ' + useCase.failedScenarios + ' failed, ' + useCase.pendingScenarios + ' pending');
  }

  _docuWriter2.default.saveUseCase((0, _merge2.default)({
    status: useCaseStatus
  }, useCase));

  _scenariooStore2.default.resetCurrentUseCase();
}

/**
 * @func scenariooReporter#scenarioStarted
 * @param {options} options
 * @param {string} scenarioName
 */
function scenarioStarted(options, scenarioName) {

  if (!options.disableScenariooLogOutput) {
    // Log an empty line, to log everything for a new scenario on its own line (after the jasmine `.`/`F`-Log entry)
    console.log('');
  }

  _scenariooStore2.default.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName,
    status: undefined
  });
}

function expectationFailed(options, failureMessage) {
  _scenariooStore2.default.updateCurrentScenario({ status: 'failed' }); // remember early that it failed already
  if (options.reportStepOnExpectationFailed) {
    _scenariooJs2.default.saveStep('Failed: ' + failureMessage, { status: 'failed', labels: ['failed'] });
  }
}

/**
 * @func scenariooReporter#scenarioEnded
 * @param {options} options
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#PENDING}
 */
function scenarioEnded(options, status) {

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
    case PENDING:
      _scenariooStore2.default.updateCurrentUseCase({
        pendingScenarios: useCase.pendingScenarios + 1
      });
      break;
    case DISABLED:
      _scenariooStore2.default.updateCurrentUseCase({
        disabledScenarios: useCase.disabledScenarios + 1
      });
      // do not further report disabled scenarios (--> return!)
      return;
    default:
      throw new Error('Unknown status ' + status);
  }

  if (!options.disableScenariooLogOutput) {
    // use stdout write here to have the following jasmine `.` or `F` or `*` output on same line with scenario output.
    // leading space because newer versions of jasmine seem to log the other way around again (seems to be very unstable how they report in jasmine)
    _process2.default.stdout.write(formatWithAnsiColorForStatus(' ' + status.toUpperCase() + ' scenario "' + useCase.name + ' - ' + scenario.name + '" ', status));
  }

  _docuWriter2.default.saveScenario((0, _merge2.default)({
    status: status
  }, scenario), useCase.name);

  _scenariooStore2.default.resetCurrentScenario();
}

function formatWithAnsiColorForStatus(message, status) {

  var colorsForStatus = {
    failed: '31', // red
    success: '32', // green
    pending: '33' // yellow
  };

  var colorCode = colorsForStatus[status];
  var startColor = colorCode ? '\x1B[' + colorCode + 'm' : '';
  var endColor = colorCode ? '\x1B[39m' : '';
  return startColor + message + endColor;
}