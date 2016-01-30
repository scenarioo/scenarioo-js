var store = require('./scenariooStore');


var SUCCESSFUL = 'successful', FAILED = 'failes', SKIPPED = 'skipped';

function reporter(options) {

  return {
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


  function runStarted() {
    if (store.isInitialized()) {
      throw new Error('Run already started!');
    }
    store.init(options);
  }

  function runEnded() {
    // clear store
  }

  function useCaseStarted(useCaseId) {
    if (!store.isInitialized()) {
      throw new Error('Cannot start useCase, run was not started!');
    }
    if (!useCaseId) {
      throw new Error('Please provide a useCaseId');
    }
    store.updateUseCase(useCaseId, {
      passedScenarios: 0,
      failedScenarios: 0,
      skippedScenarios: 0
    });
    store.setCurrentUseCaseId(useCaseId);
  }

  function useCaseEnded(useCaseId, status) {
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
    switch (status) {
      case SUCCESSFUL:
        store.updateBuild({
          passedUseCases: build.passedUseCases + 1
        });
        break;
      case FAILED:
        store.updateBuild({
          failedUseCases: build.failedUseCases + 1
        });
        break;
      case SKIPPED:
        store.updateBuild({
          skippedUseCases: build.skippedUseCases + 1
        });
        break;
      default:
        throw new Error('Unknown status ' + status);
    }
  }

  function scenarioStarted(scenarioId) {
    if (!store.getCurrentUseCase()) {
      throw new Error('Cannot start scenario, useCase was not started!');
    }
    if (!scenarioId) {
      throw new Error('Please provide a scenarioId');
    }

    store.updateScenario(scenarioId, {
      useCaseId: store.getCurrentUseCase().id
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

    switch (status) {
      case SUCCESSFUL:
        store.updateUseCase(useCase.id, {
          passedScenarios: useCase.passedScenarios + 1
        });
        break;
      case FAILED:
        store.updateUseCase(useCase.id, {
          failedScenarios: useCase.failedScenarios + 1
        });
        break;
      case SKIPPED:
        store.updateUseCase(useCase.id, {
          skippedScenarios: useCase.skippedScenarios + 1
        });
        break;
      default:
        throw new Error('Unknown statsus ' + status);
    }
  }
}

reporter.SUCCESSFUL = SUCCESSFUL;
reporter.FAILED = FAILED;
reporter.SKIPPED = SKIPPED;

module.exports = reporter;
