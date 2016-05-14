import merge from 'lodash/merge';
import path from 'path';
import store from './scenariooStore';
import docuWriter from './docuWriter/docuWriter';
import scenarioo from './scenarioo-js';
import process from 'process';

const SUCCESS = 'success';
const FAILED = 'failed';
const PENDING = 'pending';

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
  console.log(`Reporting scenarios for scenarioo. Writing to "${absoluteTargetDir}"`);
}

/**
 * @func scenariooReporter#runEnded
 */
function runEnded() {
  if (!store.isInitialized()) {
    throw new Error('Cannot end test run. No test run was started');
  }

  const build = store.getBuild();
  const status = (build.failedUseCases === 0) ? 'success' : 'failed';

  docuWriter.saveBuild({
    status: status,
    name: build.name,
    date: build.date,
    revision: build.revision
  });

  store.clear();

  console.log('All done!');
}

/**
 * @func scenariooReporter#useCaseStarted
 * @param {string} useCaseName
 */
function useCaseStarted(useCaseName) {
  if (!store.isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }
  store.updateCurrentUseCase({
    passedScenarios: 0,
    failedScenarios: 0,
    pendingScenarios: 0,
    name: useCaseName
  });
}

/**
 * @func scenariooReporter#useCaseEnded
 */
function useCaseEnded() {
  const useCase = store.getCurrentUseCase();
  const build = store.getBuild();

  const hasFailingScenarios = useCase.failedScenarios > 0;
  const hasPassedScenarios = useCase.passedScenarios > 0;
  const hasPendingScenarios = useCase.pendingScenarios > 0;
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

  // starting this log with a new line, because of jasmines ./F/*-Log-Entries inbetween, that do not have line breaks.
  console.log(`\n${useCaseStatus.toUpperCase()} use case \"${useCase.name}\": ${useCase.passedScenarios} passed, ${useCase.failedScenarios} failed, ${ useCase.pendingScenarios} pending`);

  docuWriter.saveUseCase(merge({
    status: useCaseStatus
  }, useCase));

  store.resetCurrentUseCase();
}

/**
 * @func scenariooReporter#scenarioStarted
 * @param {string} scenarioName
 */
function scenarioStarted(scenarioName) {

  // Log an empty line, to log everything for a new scenario on its own line (after the jasmine `.`/`F`-Log entry)
  console.log('');

  store.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName,
    status: undefined
  });
}

function expectationFailed(options, failureMessage) {
  store.updateCurrentScenario({ status: 'failed'}); // remember early that it failed allready
  if (options.reportStepOnExpectationFailed) {
    scenarioo.saveStep('Failed: ' + failureMessage, {status: 'failed', labels: ['failed']});
  }
}

/**
 * @func scenariooReporter#scenarioEnded
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#PENDING}
 */
function scenarioEnded(status) {
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
    default:
      throw new Error(`Unknown status ${status}`);
  }

  // using process.stdout.write here to have the following jasmine ./* Log entry belonging to this same scenario on the same line (does somehow not work on windows?).
  process.stdout.write(formatWithAnsiColorForStatus(`${status.toUpperCase()} scenario "${useCase.name} - ${scenario.name}" `, status));

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
  var endColor = colorCode ? '\u001B[0m' : '';
  return startColor + message + endColor;

}
