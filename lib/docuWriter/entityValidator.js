'use strict';

var
  tv4 = require('tv4'),
  _ = require('lodash');

var schemas = {
  branch: require('./validationSchemas/branch.json'),
  build: require('./validationSchemas/build.json'),
  useCase: require('./validationSchemas/useCase.json'),
  scenario: require('./validationSchemas/scenario.json'),
  step: require('./validationSchemas/step.json'),
  labels: require('./validationSchemas/labels.json'),
  details: require('./validationSchemas/details.json')
};

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
tv4.addSchema(schemas.labels);
tv4.addSchema(schemas.details);

function toMessage(validationResult) {
  var messageParts = [];

  validationResult.errors.forEach(function (error) {
    messageParts.push(error.message + ' (' + error.dataPath + ', ' + error.schemaPath + ')');
  });

  return messageParts.join(' | ');
}

function validate(object, schema) {
  var result = tv4.validateMultiple(object, schema);
  if (!result.valid) {
    throw new Error(toMessage(result));
  }
}

module.exports = {
  validateBuild: _.partialRight(validate, schemas.build),
  validateBranch: _.partialRight(validate, schemas.branch),
  validateUseCase: _.partialRight(validate, schemas.useCase),
  validateScenario: _.partialRight(validate, schemas.scenario),
  validateStep: _.partialRight(validate, schemas.step)
};
