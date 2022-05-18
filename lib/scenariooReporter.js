"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _merge = _interopRequireDefault(require("lodash/merge"));

var _path = _interopRequireDefault(require("path"));

var _scenariooStore = _interopRequireDefault(require("./scenariooStore"));

var _docuWriter = _interopRequireDefault(require("./docuWriter/docuWriter"));

var _scenariooJs = _interopRequireDefault(require("./scenarioo-js"));

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var _default = {
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

exports["default"] = _default;

function runStarted(options) {
  // some reporters (jasmine) need to initialize the store even before the run starts
  // so at this point here, the store might already be set up and good to go.
  if (!_scenariooStore["default"].isInitialized()) {
    _scenariooStore["default"].init(options);
  }

  if (options.pageNameExtractor) {
    _docuWriter["default"].registerPageNameFunction(options.pageNameExtractor);
  }

  _scenariooStore["default"].setBuildDate(new Date());

  var absoluteTargetDir = _path["default"].resolve(options.targetDirectory);

  _docuWriter["default"].start(_scenariooStore["default"].getBranch(), _scenariooStore["default"].getBuild().name, absoluteTargetDir, options);

  if (!options.disableScenariooLogOutput) {
    console.log("Reporting scenarios for scenarioo. Writing to \"".concat(absoluteTargetDir, "\""));
  }
}
/**
 * @func scenariooReporter#runEnded
 * @param {object} options
 */


function runEnded(options) {
  if (!_scenariooStore["default"].isInitialized()) {
    throw new Error('Cannot end test run. No test run was started');
  }

  var build = _scenariooStore["default"].getBuild();

  var status = build.failedUseCases === 0 ? 'success' : 'failed';

  _docuWriter["default"].saveBuild({
    status: status,
    name: build.name,
    date: build.date,
    revision: build.revision
  });

  _scenariooStore["default"].clear();

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
  if (!_scenariooStore["default"].isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }

  _scenariooStore["default"].updateCurrentUseCase({
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
  var useCase = _scenariooStore["default"].getCurrentUseCase();

  var build = _scenariooStore["default"].getBuild();

  var hasFailingScenarios = useCase.failedScenarios > 0;
  var hasPassedScenarios = useCase.passedScenarios > 0;
  var hasPendingScenarios = useCase.pendingScenarios > 0;
  var hasDisabledScenarios = useCase.disabledScenarios > 0;
  var useCaseStatus;

  if (hasFailingScenarios) {
    _scenariooStore["default"].updateBuild({
      failedUseCases: build.failedUseCases + 1
    });

    useCaseStatus = FAILED;
  } else if (hasPassedScenarios) {
    _scenariooStore["default"].updateBuild({
      passedUseCases: build.passedUseCases + 1
    });

    useCaseStatus = SUCCESS;
  } else if (hasPendingScenarios) {
    _scenariooStore["default"].updateBuild({
      pendingUseCases: build.pendingUseCases + 1
    });

    useCaseStatus = PENDING;
  } else if (hasDisabledScenarios) {
    // only disabled scenarios ---> do not report whole use case (consider it as disabled as a whole)
    return;
  } else {
    // Use case without any scenarios is considered an empty scenario with status SUCCESS.
    // (probably we can not distinguish between disabled and empty use case here, therefore we just report it as SUCCESS)
    _scenariooStore["default"].updateBuild({
      passedUseCases: build.passedUseCases + 1
    });

    useCaseStatus = SUCCESS;
  }

  if (!options.disableScenariooLogOutput) {
    // starting this log with a new line, because of jasmines ./F/*-Log-Entries inbetween, that do not have line breaks.
    console.log("\n".concat(useCaseStatus.toUpperCase(), " use case \"").concat(useCase.name, "\": ").concat(useCase.passedScenarios, " passed, ").concat(useCase.failedScenarios, " failed, ").concat(useCase.pendingScenarios, " pending"));
  }

  _docuWriter["default"].saveUseCase((0, _merge["default"])({
    status: useCaseStatus
  }, useCase));

  _scenariooStore["default"].resetCurrentUseCase();
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

  _scenariooStore["default"].updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName,
    status: undefined
  });
}

function expectationFailed(options, failureMessage) {
  _scenariooStore["default"].updateCurrentScenario({
    status: 'failed'
  }); // remember early that it failed already


  if (options.reportStepOnExpectationFailed) {
    _scenariooJs["default"].saveStep('Failed: ' + failureMessage, {
      status: 'failed',
      labels: ['failed']
    });
  }
}
/**
 * @func scenariooReporter#scenarioEnded
 * @param {options} options
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#PENDING}
 */


function scenarioEnded(options, status) {
  var scenario = _scenariooStore["default"].getCurrentScenario();

  var useCase = _scenariooStore["default"].getCurrentUseCase();

  switch (status) {
    case SUCCESS:
      _scenariooStore["default"].updateCurrentUseCase({
        passedScenarios: useCase.passedScenarios + 1
      });

      break;

    case FAILED:
      _scenariooStore["default"].updateCurrentUseCase({
        failedScenarios: useCase.failedScenarios + 1
      });

      break;

    case PENDING:
      _scenariooStore["default"].updateCurrentUseCase({
        pendingScenarios: useCase.pendingScenarios + 1
      });

      break;

    case DISABLED:
      _scenariooStore["default"].updateCurrentUseCase({
        disabledScenarios: useCase.disabledScenarios + 1
      }); // do not further report disabled scenarios (--> return!)


      return;

    default:
      throw new Error("Unknown status ".concat(status));
  }

  if (!options.disableScenariooLogOutput) {
    // use stdout write here to have the following jasmine `.` or `F` or `*` output on same line with scenario output.
    // leading space because newer versions of jasmine seem to log the other way around again (seems to be very unstable how they report in jasmine)
    _process["default"].stdout.write(formatWithAnsiColorForStatus(" ".concat(status.toUpperCase(), " scenario \"").concat(useCase.name, " - ").concat(scenario.name, "\" "), status));
  }

  _docuWriter["default"].saveScenario((0, _merge["default"])({
    status: status
  }, scenario), useCase.name);

  _scenariooStore["default"].resetCurrentScenario();
}

function formatWithAnsiColorForStatus(message, status) {
  var colorsForStatus = {
    failed: '31',
    // red
    success: '32',
    // green
    pending: '33' // yellow

  };
  var colorCode = colorsForStatus[status];
  var startColor = colorCode ? "\x1B[" + colorCode + 'm' : '';
  var endColor = colorCode ? "\x1B[39m" : '';
  return startColor + message + endColor;
}