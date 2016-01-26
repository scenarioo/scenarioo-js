'use strict';

var
  tv4 = require('tv4'),
  _ = require('lodash');

var entitySchemas = {
  Branch: require('./validationSchemas/branch.json'),
  Build: require('./validationSchemas/build.json'),
  UseCase: require('./validationSchemas/useCase.json'),
  Scenario: require('./validationSchemas/scenario.json'),
  Step: require('./validationSchemas/step.json')
};

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
tv4.addSchema(require('./validationSchemas/labels.json'));
tv4.addSchema(require('./validationSchemas/details.json'));

function toMessage(validationResult) {
  var messageParts = validationResult.errors.map(function (error) {
    return error.message + ' (' + error.dataPath + ', ' + error.schemaPath + ')';
  });
  return messageParts.join(' | ');
}

function validate(schema, schemaName, object) {
  var result = tv4.validateMultiple(object, schema);
  if (!result.valid) {
    throw new Error(schemaName + ': ' + toMessage(result));
  }
}

// expose "validate[EntityName]"  functions
_.forEach(entitySchemas, function (schema, entityName) {
  module.exports['validate' + entityName] = validate.bind(undefined, schema, entityName);
});
