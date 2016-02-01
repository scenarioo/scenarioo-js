var
  _ = require('lodash'),
  format = require('util').format,
  path = require('path'),
  store = require('./scenariooStore'),
  docuWriter = require('./docuWriter/docuWriter');

var SUCCESSFUL = 'successful', FAILED = 'failed', SKIPPED = 'skipped';

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

  SUCCESSFUL: SUCCESSFUL,
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
  store.setBuildDate(new Date().toISOString());
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

function useCaseStarted(useCaseId, useCaseName) {
  if (!store.isInitialized()) {
    throw new Error('Cannot start useCase, run was not started!');
  }
  if (!useCaseId) {
    throw new Error('Please provide a useCaseId');
  }
  if (store.getCurrentUseCase()) {
    throw new Error('Cannot start useCase \'' + useCaseId + '\', useCase \'' + store.getCurrentUseCase().id + '\' currently running');
  }

  store.updateUseCase(useCaseId, {
    passedScenarios: 0,
    failedScenarios: 0,
    skippedScenarios: 0,
    name: useCaseName
  });
  store.setCurrentUseCaseId(useCaseId);
}

function useCaseEnded(useCaseId) {
  var currentUseCase = store.getCurrentUseCase();

  if (!currentUseCase) {
    throw new Error('Cannot end useCase, no useCase was started!');
  }
  if (!useCaseId) {
    throw new Error('Please provide a useCaseId');
  }
  if (currentUseCase.id !== useCaseId) {
    throw new Error('Cannot end useCase \'' + useCaseId + '\', current useCase is \'' + currentUseCase.id + '\'');
  }

  var build = store.getBuild();
  var translatedStatus, hasFailingScenarios = currentUseCase.failedScenarios > 0;
  if (hasFailingScenarios) {
    store.updateBuild({
      failedUseCases: build.failedUseCases + 1
    });
    translatedStatus = 'failed';
  } else {
    store.updateBuild({
      passedUseCases: build.passedUseCases + 1
    });
    translatedStatus = 'succeeded';
  }

  console.log(format('useCase :: %s :: %s (%d passed, %d failed, %d skipped)',
    currentUseCase.name,
    translatedStatus,
    currentUseCase.passedScenarios,
    currentUseCase.failedScenarios,
    currentUseCase.skippedScenarios));

  docuWriter.saveUseCase(_.merge({
    name: currentUseCase.name,
    status: hasFailingScenarios ? 'failed' : 'success'
  }, {description: currentUseCase.description}));

  store.setCurrentUseCaseId(undefined);
}

function scenarioStarted(scenarioId, scenarioName) {
  if (!store.getCurrentUseCase()) {
    throw new Error('Cannot start scenario, useCase was not started!');
  }
  if (!scenarioId) {
    throw new Error('Please provide a scenarioId');
  }
  if (store.getCurrentScenario()) {
    throw new Error('Cannot start scenario \'' + scenarioId + '\', scenario \'' + store.getCurrentScenario().id + '\' currently running');
  }

  store.updateScenario(scenarioId, {
    useCaseId: store.getCurrentUseCase().id,
    name: scenarioName
  });
  store.setCurrentScenarioId(scenarioId);
}

function scenarioEnded(scenarioId, status) {
  var currentScenario = store.getCurrentScenario();
  if (!currentScenario) {
    throw new Error('Cannot end scenario, no scenario was started!');
  }
  if (!scenarioId) {
    throw new Error('Please provide a scenarioId');
  }
  if (currentScenario.id !== scenarioId) {
    throw new Error('Cannot end scenario \'' + scenarioId + '\', current scenario is \'' + currentScenario.id + '\'');
  }

  var useCase = store.getCurrentUseCase();
  var translatedStatus;
  switch (status) {
    case SUCCESSFUL:
      store.updateUseCase(useCase.id, {
        passedScenarios: useCase.passedScenarios + 1
      });
      translatedStatus = 'succeed';
      break;
    case FAILED:
      store.updateUseCase(useCase.id, {
        failedScenarios: useCase.failedScenarios + 1
      });
      translatedStatus = 'failed';
      break;
    case SKIPPED:
      store.updateUseCase(useCase.id, {
        skippedScenarios: useCase.skippedScenarios + 1
      });
      translatedStatus = 'skipped';
      break;
    default:
      throw new Error('Unknown status ' + status);
  }

  console.log(format('scenario :: %s :: %s', currentScenario.name, translatedStatus));

  docuWriter.saveScenario(_.merge({
    name: currentScenario.name,
    status: status === FAILED ? 'failed' : 'success'
  }, {description: currentScenario.description}), useCase.name);

  store.setCurrentScenarioId(undefined);
}
