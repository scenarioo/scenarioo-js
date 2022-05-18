import merge from 'lodash/merge';
import path from 'path';
import store from './scenariooStore';
import docuWriter from './docuWriter/docuWriter';
import scenarioo from './scenarioo-js';
import process from 'process';

const SUCCESS = 'success';
const FAILED = 'failed';
const PENDING = 'pending';
const DISABLED = 'disabled';

/**
 * This is the base reporter that pulls information from the store and the calling (framework-dependant) reporter
 * and invokes docuWriter in order to create the scenarioo documentation.
 *
 * This base reporter is testing-framework agnostic!
 *
 * @namespace scenariooReporter
 */
export default {
  runStarted,
  runEnded,

  useCaseStarted,
  useCaseEnded,

  scenarioStarted,
  scenarioEnded,

  expectationFailed,

  /** @constant {string} scenariooReporter#SUCCESS*/
  SUCCESS,
  /** @constant {string} scenariooReporter#FAILED*/
  FAILED,
  /** @constant {string} scenariooReporter#PENDING*/
  PENDING
};

/**
 * @func scenariooReporter#runStarted
 * @param {object} options
 */
function runStarted(options) {
  // some reporters (jasmine) need to initialize the store even before the run starts
  // so at this point here, the store might already be set up and good to go.
  if (!store.isInitialized()) {
    store.init(options);
  }

  if (options.pageNameExtractor) {
    docuWriter.registerPageNameFunction(options.pageNameExtractor);
  }

  store.setBuildDate(new Date());
  const absoluteTargetDir = path.resolve(options.targetDirectory);
  docuWriter.start(store.getBranch(), store.getBuild().name, absoluteTargetDir, options);
  if (!options.disableScenariooLogOutput) {
    console.log(`Reporting scenarios for scenarioo. Writing to "${absoluteTargetDir}"`);
  }
}

/**
 * @func scenariooReporter#runEnded
 * @param {object} options
 */
function runEnded(options) {
  if (!store.isInitialized()) {
    throw new Error('Cannot end test run. No test run was started');
  }

  const build = store.getBuild();
  const status = (build.failedUseCases === 0) ? 'success' : 'failed';

  const saveProm = docuWriter.saveBuild({
    status: status,
    name: build.name,
    date: build.date,
    revision: build.revision
  });

  store.clear();
  if (!options.disableScenariooLogOutput) {
    console.log('All done!');
  }
  return saveProm;
}

/**
 * @func scenariooReporter#useCaseStarted
 * @param {object} options
 * @param {string} useCaseName
 */
function useCaseStarted(options, useCaseName) {
  if (!store.isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }
  store.updateCurrentUseCase({
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

  const useCase = store.getCurrentUseCase();
  const build = store.getBuild();

  const hasFailingScenarios = useCase.failedScenarios > 0;
  const hasPassedScenarios = useCase.passedScenarios > 0;
  const hasPendingScenarios = useCase.pendingScenarios > 0;
  const hasDisabledScenarios = useCase.disabledScenarios > 0;
  let useCaseStatus;
  if (hasFailingScenarios) {
    store.updateBuild({
      failedUseCases: build.failedUseCases + 1
    });
    useCaseStatus = FAILED;
  } else if (hasPassedScenarios) {
    store.updateBuild({
      passedUseCases: build.passedUseCases + 1
    });
    useCaseStatus = SUCCESS;
  } else if (hasPendingScenarios) {
    store.updateBuild({
      pendingUseCases: build.pendingUseCases + 1
    });
    useCaseStatus = PENDING;
  }
  else if (hasDisabledScenarios) {
    // only disabled scenarios ---> do not report whole use case (consider it as disabled as a whole)
    return;
  }
  else {
    // Use case without any scenarios is considered an empty scenario with status SUCCESS.
    // (probably we can not distinguish between disabled and empty use case here, therefore we just report it as SUCCESS)
    store.updateBuild({
      passedUseCases: build.passedUseCases + 1
    });
    useCaseStatus = SUCCESS;
  }

  if (!options.disableScenariooLogOutput) {
    // starting this log with a new line, because of jasmines ./F/*-Log-Entries inbetween, that do not have line breaks.
    console.log(`\n${useCaseStatus.toUpperCase()} use case "${useCase.name}": ${useCase.passedScenarios} passed, ${useCase.failedScenarios} failed, ${ useCase.pendingScenarios} pending`);
  }

  docuWriter.saveUseCase(merge({
    status: useCaseStatus
  }, useCase));

  store.resetCurrentUseCase();
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

  store.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName,
    status: undefined
  });
}

function expectationFailed(options, failureMessage) {
  store.updateCurrentScenario({ status: 'failed'}); // remember early that it failed already
  if (options.reportStepOnExpectationFailed) {
    scenarioo.saveStep('Failed: ' + failureMessage, {status: 'failed', labels: ['failed']});
  }
}

/**
 * @func scenariooReporter#scenarioEnded
 * @param {options} options
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#PENDING}
 */
function scenarioEnded(options, status) {

  const scenario = store.getCurrentScenario();
  const useCase = store.getCurrentUseCase();

  switch (status) {
    case SUCCESS:
      store.updateCurrentUseCase({
        passedScenarios: useCase.passedScenarios + 1
      });
      break;
    case FAILED:
      store.updateCurrentUseCase({
        failedScenarios: useCase.failedScenarios + 1
      });
      break;
    case PENDING:
      store.updateCurrentUseCase({
        pendingScenarios: useCase.pendingScenarios + 1
      });
      break;
    case DISABLED:
      store.updateCurrentUseCase({
        disabledScenarios: useCase.disabledScenarios + 1
      });
      // do not further report disabled scenarios (--> return!)
      return;
    default:
      throw new Error(`Unknown status ${status}`);
  }

  if (!options.disableScenariooLogOutput) {
    // use stdout write here to have the following jasmine `.` or `F` or `*` output on same line with scenario output.
    // leading space because newer versions of jasmine seem to log the other way around again (seems to be very unstable how they report in jasmine)
    process.stdout.write(formatWithAnsiColorForStatus(` ${status.toUpperCase()} scenario "${useCase.name} - ${scenario.name}" `, status));
  }

  docuWriter.saveScenario(merge({
    status: status
  }, scenario), useCase.name);

  store.resetCurrentScenario();
}

function formatWithAnsiColorForStatus(message, status) {

  var colorsForStatus = {
    failed: '31', // red
    success: '32', // green
    pending: '33' // yellow
  };

  var colorCode = colorsForStatus[status];
  var startColor = colorCode ? '\u001B[' + colorCode + 'm' : '';
  var endColor = colorCode ? '\u001B[39m' : '';
  return startColor + message + endColor;

}
