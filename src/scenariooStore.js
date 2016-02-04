var Immutable = require('immutable');

/**
 * The Scenarioo Store holds information about the current test run.
 *
 * The reporter and the docuWriter can access and store information here.
 *
 * The inner state itself is an immutable object. every accessor method will return a plain javaScript object.
 * When this returned object is modified, the inner state is not affected.
 *
 * @namespace scenariooStore
 */

var state;

/**
 * initializes the store (resets state)
 *
 * @func scenariooStore#init
 * @param {object} options
 * @param {string} options.branchName
 * @param {string} options.branchDescription
 * @param {string} options.buildName
 * @param {string} options.revision
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
    }
    // will contain additional attributes:
    // - currentUseCase
    // - currentScenario
  });
}

/**
 * Clears the inner state of the store
 * @func scenariooStore#clear
 */
function clear() {
  state = undefined;
}

/**
 *
 * @func scenariooStore#incrementStepCounter
 * @returns {number} the incremented stepCount
 */
function incrementStepCounter() {
  getCurrentScenario(); // make sure currentScenario exists

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
  if (!state.get('currentUseCase')) {
    state = state.set('currentUseCase', new Immutable.Map());
  }
  return state.get('currentUseCase').toJS();
}

function updateCurrentUseCase(useCase) {
  state = state.update('currentUseCase', new Immutable.Map(), function (originalUseCase) {
    return originalUseCase.merge(useCase);
  });
}

function resetCurrentUseCase() {
  state = state.remove('currentUseCase');
}

function getCurrentScenario() {
  if (!state.get('currentScenario')) {
    state = state.set('currentScenario', new Immutable.Map());
  }
  return state.get('currentScenario').toJS();
}

function updateCurrentScenario(scenario) {
  state = state.update('currentScenario', new Immutable.Map(), function (originalScenario) {
    return originalScenario.merge(scenario);
  });
}

/**
 * @func scenariooStore#resetCurrentScenario
 */
function resetCurrentScenario() {
  state = state.remove('currentScenario');
}

/**
 * Returns the whole state of the store
 * @func scenariooStore#dump
 */
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
  setBuildDate: setBuildDate,
  updateBuild: updateBuild,

  getCurrentUseCase: getCurrentUseCase,
  updateCurrentUseCase: updateCurrentUseCase,
  resetCurrentUseCase: resetCurrentUseCase,

  getCurrentScenario: getCurrentScenario,
  updateCurrentScenario: updateCurrentScenario,
  resetCurrentScenario: resetCurrentScenario,

  incrementStepCounter: incrementStepCounter
};
