'use strict';

var _ = require('lodash');


function isValidStatus(status) {
  return status !== 'success' && status !== 'failed';
}
function validateBuild(build) {

  if (_.isUndefined(build.name)) {
    throw new Error('Build must contain attribute "name"');
  }
  if (_.isUndefined(build.date)) {
    throw new Error('Build must contain attribute "date"');
  }
  if (_.isUndefined(build.status)) {
    throw new Error('Build must contain attribute "status"');
  }

  if (isValidStatus(build.status)) {
    throw new Error('Build must contain attribute "status" with value "success" or "failed". Was ' + build.status);
  }
}

function validateBranch(branch) {
  if (_.isUndefined(branch.name)) {
    throw new Error('Branch must contain attribute "name"');
  }
}

function validateUseCase(useCase) {
  if (_.isUndefined(useCase.name)) {
    throw new Error('UseCase must contain attribute "name"');
  }

  if (_.isUndefined(useCase.status)) {
    throw new Error('UseCase must contain attribute "status"');
  }

  if (isValidStatus(useCase.status)) {
    throw new Error('UseCase must contain attribute "status" with value "success" or "failed". Was ' + useCase.status);
  }
}

function validateScenario(scenario) {
  if (_.isUndefined(scenario.name)) {
    throw new Error('Scenario must contain attribute "name"');
  }

  if (_.isUndefined(scenario.status)) {
    throw new Error('Scenario must contain attribute "status"');
  }

  if (isValidStatus(scenario.status)) {
    throw new Error('Scenario must contain attribute "status" with value "success" or "failed". Was ' + scenario.status);
  }
}

module.exports = {
  validateBuild: validateBuild,
  validateBranch: validateBranch,
  validateUseCase: validateUseCase,
  validateScenario: validateScenario
};
