'use strict';

var _ = require('lodash');

var scenarioo;

function describeUseCase(useCaseName, useCaseDescription, callback) {
  if (_.isFunction(useCaseDescription)) {
    callback = useCaseDescription;
    useCaseDescription = '';
  }

  if (!scenarioo.getReporter()) {
    throw new Error('Please register a reporter by invoking "scenarioo.useReporter(...)');
  }

  scenarioo.getReporter().describeUseCase(useCaseName, useCaseDescription, callback);
}

function describeScenario(scenarioName, scenarioDescription, callback) {
  if (_.isFunction(scenarioDescription)) {
    callback = scenarioDescription;
    scenarioDescription = '';
  }

  if (!scenarioo.getReporter()) {
    throw new Error('Please register a reporter by invoking "scenarioo.useReporter(...)');
  }

  scenarioo.getReporter().describeScenario(scenarioName, scenarioDescription, callback);
}

function registerGlobals() {
  global.describeUseCase = describeUseCase;
  global.describeScenario = describeScenario;
}


module.exports = function (scenariooObject) {
  scenarioo = scenariooObject;
};

registerGlobals();
