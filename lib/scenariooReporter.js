var
  _ = require('lodash'),
  format = require('util').format,
  path = require('path'),
  store = require('./scenariooStore'),
  docuWriter = require('./docuWriter/docuWriter');

var SUCCESS = 'success', FAILED = 'failed', SKIPPED = 'skipped';

/**
 * This is the base reporter that pulls information from the store and the calling (framework-dependant) reporter
 * and invokes docuWriter in order to create the scenarioo documentation.
 *
 * This base reporter is testing-framework agnostic!
 */
module.exports = {
  runStarted: runStarted,
  runEnded: runEnded,

  useCaseStarted: useCaseStarted,
  useCaseEnded: useCaseEnded,

  scenarioStarted: scenarioStarted,
  scenarioEnded: scenarioEnded,

  SUCCESS: SUCCESS,
  FAILED: FAILED,
  SKIPPED: SKIPPED
};

function runStarted(options) {
  // some reporters (jasmine) need to initialize the store even before the run starts
  // so at this point here, the store might already be set up and good to go.
  if (!store.isInitialized()) {
    store.init(options);
  }

  if (options.pageNameExtractor) {
    docuWriter.registerPageNameFunction(options.pageNameExtractor);
  }

  var absoluteTargetDir = path.resolve(options.targetDirectory);
  store.setBuildDate(new Date());
  docuWriter.start(store.getBranch(), store.getBuild().name, absoluteTargetDir);

  console.log('Reporting scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
}

function runEnded() {
  if (!store.isInitialized()) {
    throw new Error('Cannot end test run. No test run was started');
  }

  var build = store.getBuild();
  var status = (build.failedUseCases === 0) ? 'success' : 'failed';

  docuWriter.saveBuild({
    status: status,
    name: build.name,
    date: build.date,
    revision: build.revision
  });

  store.clear();

  console.log('All done!');
}

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

function useCaseEnded() {
  var useCase = store.getCurrentUseCase();
  var build = store.getBuild();

  var hasFailingScenarios = useCase.failedScenarios > 0;
  var hasPassedScenarios = useCase.passedScenarios > 0;
  var hasSkippedScenarios = useCase.skippedScenarios > 0;
  var useCaseStatus;
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

  docuWriter.saveUseCase(_.merge({
    status: useCaseStatus
  }, useCase));

  store.resetCurrentUseCase();
}

function scenarioStarted(scenarioName) {
  store.updateCurrentScenario({
    stepCounter: -1,
    name: scenarioName
  });
}

function scenarioEnded(status) {
  var scenario = store.getCurrentScenario();
  var useCase = store.getCurrentUseCase();

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

  docuWriter.saveScenario(_.merge({
    status: status
  }, scenario), useCase.name);

  store.resetCurrentScenario();
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
