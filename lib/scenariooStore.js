var
  _ = require('lodash'),
  Immutable = require('immutable');

/**
 * The Scenarioo Store holds information about the current test run.
 *
 * The scenarioo dsl ("describeUseCase" + "describeScenario"), the reporter and the docuWriter can access and store information here.
 *
 * The inner state itself is an immutable object. every accessor method will return a plain javaScript object.
 * When this returned object is modified, the inner state is not affected.
 *
 */

var state;

/**
 * initializes the store (resets state)
 * @param {object} options Options Object with the following properties: "branchName", "branchDescription", "buildName" and "revision"
 */
function init(options) {
  state = Immutable.fromJS({
    branch: {
      name: options.branchName,
      description: options.branchDescription
    },
    build: {
      name: options.buildName,
      revision: options.revision,
      passedUseCases: 0,
      failedUseCases: 0,
      skippedUseCases: 0
    },
    useCases: {},
    scenarios: {},
    currentUseCase: undefined, // the id of the currentUseCase if any
    currentScenario: undefined // the id of the currentScenario if any
  });
}

function clear() {
  state = undefined;
}

function incrementStepCounter() {
  if (!getCurrentScenario()) {
    throw new Error('Cannot increment step counter. No Current Scenario set!');
  }

  state = state.updateIn(['scenarios', getCurrentScenario().id, 'stepCounter'], -1, function (stepCounter) {
    return stepCounter + 1;
  });

  return state.getIn(['scenarios', getCurrentScenario().id, 'stepCounter']);
}

function getBuild() {
  return state.get('build').toJS();
}

function getBranch() {
  return state.get('branch').toJS();
}

function updateBuild(build) {
  state = state.update('build', function (originalBuild) {
    return originalBuild.merge(build);
  });
}

function setBuildDate(buildDate) {
  state = state.setIn(['build', 'date'], buildDate);
}

function getCurrentUseCase() {
  var useCaseId = state.get('currentUseCase');
  return getUseCase(useCaseId);
}

function setCurrentUseCaseId(useCaseId) {
  state = state.set('currentUseCase', useCaseId);
}

function updateUseCase(useCaseId, useCase) {

  var defaultUseCaseObject = new Immutable.Map({id: useCaseId});

  if (!useCase || _.size(useCase) < 1) {
    state = state.setIn(['useCases', useCaseId], defaultUseCaseObject);
  } else {
    state = state.updateIn(['useCases', useCaseId], defaultUseCaseObject, function (originalUseCase) {
      return originalUseCase.merge(useCase);
    });
  }
}

function getUseCase(useCaseId) {
  var useCase = state.getIn(['useCases', useCaseId]);
  return useCase ? useCase.toJS() : undefined;
}

function updateScenario(scenarioId, scenario) {
  var defaultScenarioObject = new Immutable.Map({id: scenarioId});

  if (!scenario || _.size(scenario) < 1) {
    state = state.setIn(['scenarios', scenarioId], defaultScenarioObject);
  } else {
    state = state.updateIn(['scenarios', scenarioId], defaultScenarioObject, function (originalScenario) {
      return originalScenario.merge(scenario);
    });
  }
}

function getScenario(scenarioId) {
  var scenario = state.getIn(['scenarios', scenarioId]);
  return scenario ? scenario.toJS() : undefined;
}

function getCurrentScenario() {
  var scenarioId = state.get('currentScenario');
  return getScenario(scenarioId);
}

function setCurrentScenarioId(scenarioId) {
  state = state.set('currentScenario', scenarioId);
}

function dump() {
  if (!state) {
    throw new Error('Store is not initialized!');
  }
  return state.toJS();
}

function isInitialized() {
  return !!state;
}

module.exports = {
  init: init,
  isInitialized: isInitialized,
  clear: clear,
  dump: dump,
  getBranch: getBranch,
  getBuild: getBuild,
  getCurrentUseCase: getCurrentUseCase,
  setCurrentUseCaseId: setCurrentUseCaseId,
  getUseCase: getUseCase,
  updateUseCase: updateUseCase,
  setBuildDate: setBuildDate,
  updateBuild: updateBuild,
  updateScenario: updateScenario,
  getScenario: getScenario,
  setCurrentScenarioId: setCurrentScenarioId,
  getCurrentScenario: getCurrentScenario,
  incrementStepCounter: incrementStepCounter
};
