import merge from 'lodash/merge';
import { format } from 'util';
import path from 'path';
import store from './scenariooStore';
import docuWriter from './docuWriter/docuWriter';

const SUCCESS = 'success';
const FAILED = 'failed';
const SKIPPED = 'skipped';

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

  /** @constant {string} scenariooReporter#SUCCESS*/
  SUCCESS,
  /** @constant {string} scenariooReporter#FAILED*/
  FAILED,
  /** @constant {string} scenariooReporter#SKIPPED*/
  SKIPPED
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

  const absoluteTargetDir = path.resolve(options.targetDirectory);
  store.setBuildDate(new Date());
  docuWriter.start(store.getBranch(), store.getBuild().name, absoluteTargetDir);

  console.log('Reporting scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
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
    skippedScenarios: 0,
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
  const hasSkippedScenarios = useCase.skippedScenarios > 0;
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
  } else if (hasSkippedScenarios) {
    store.updateBuild({
      skippedUseCases: build.skippedUseCases + 1
    });
    useCaseStatus = SKIPPED;
  }

  console.log(format('useCase :: %s :: %s (%d passed, %d failed, %d skipped)',
    useCase.name,
    translateStatusForLogMessages(useCaseStatus),
    useCase.passedScenarios,
    useCase.failedScenarios,
    useCase.skippedScenarios));

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
  store.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName
  });
}

/**
 * @func scenariooReporter#scenarioEnded
 * @param {string} status one of {@link scenariooReporter#SUCCESS}, {@link scenariooReporter#FAILED}, {@link scenariooReporter#SKIPPED}
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
    case SKIPPED:
      store.updateCurrentUseCase({
        skippedScenarios: useCase.skippedScenarios + 1
      });
      break;
    default:
      throw new Error('Unknown status ' + status);
  }

  console.log(format('scenario :: %s :: %s', scenario.name, translateStatusForLogMessages(status)));

  docuWriter.saveScenario(merge({
    status: status
  }, scenario), useCase.name);

  store.resetCurrentScenario();
}


function translateStatusForLogMessages(status) {
  if (!status) {
    return 'n/a';
  }

  const map = {};
  map[SUCCESS] = 'suceeded';
  map[FAILED] = 'failed';
  map[SKIPPED] = 'skipped';
  const mapped = map[status];
  if (!mapped) {
    return 'n/a';
  }
  return mapped;
}
