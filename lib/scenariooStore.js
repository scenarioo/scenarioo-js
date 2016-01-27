var Immutable = require('immutable');

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
      failedUseCases: 0
    },
    useCases: {},
    scenarios: {},
    currentUseCase: undefined,
    currentScenario: undefined
  });
}

function clear() {
  state = undefined;
}

function incrementStepCounter() {
  if (!state.get('currentScenario')) {
    throw new Error('Cannot increment step counter. No Current Scenario set!');
  }

  state = state.updateIn(['currentScenario', 'stepCounter'], -1, function (stepCounter) {
    return stepCounter + 1;
  });

  return state.getIn(['currentScenario', 'stepCounter']);
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
  var useCase = state.get('currentUseCase');
  return useCase ? useCase.toJS() : undefined;
}

function setCurrentUseCase(useCase) {
  state = state.set('currentUseCase', Immutable.fromJS(useCase));
}

function updateUseCase(useCaseId, useCase) {
  state = state.updateIn(['useCases', useCaseId], new Immutable.Map({id: useCaseId}), function (originalUseCase) {
    return originalUseCase.merge(useCase);
  });
}

function getUseCase(useCaseId) {
  var useCase = state.getIn(['useCases', useCaseId]);
  return useCase ? useCase.toJS() : undefined;
}

function updateScenario(scenarioId, scenario) {
  state = state.updateIn(['scenarios', scenarioId], new Immutable.Map({id: scenarioId}), function (originalScenario) {
    return originalScenario.merge(scenario);
  });
}

function getScenario(scenarioId) {
  var scenario = state.getIn(['scenarios', scenarioId]);
  return scenario ? scenario.toJS() : undefined;
}

function getCurrentScenario() {
  var scenario = state.get('currentScenario');
  return scenario ? scenario.toJS() : undefined;
}

function setCurrentScenario(scenario) {
  state = state.set('currentScenario', Immutable.fromJS(scenario));
}

function dump() {
  return state.toJS();
}

module.exports = {
  init: init,
  clear: clear,
  dump: dump,
  getBranch: getBranch,
  getBuild: getBuild,
  getCurrentUseCase: getCurrentUseCase,
  setCurrentUseCase: setCurrentUseCase,
  getUseCase: getUseCase,
  updateUseCase: updateUseCase,
  setBuildDate: setBuildDate,
  updateBuild: updateBuild,
  updateScenario: updateScenario,
  getScenario: getScenario,
  setCurrentScenario: setCurrentScenario,
  getCurrentScenario: getCurrentScenario,
  incrementStepCounter: incrementStepCounter
};
