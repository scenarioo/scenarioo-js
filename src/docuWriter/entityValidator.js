import path from 'path';
import fs from 'fs';
import tv4 from 'tv4';
import glob from 'glob';

import isDate from 'lodash/isDate';

const entitySchemas = loadSchemas();

export function loadSchemas() {
  // load json files in-sync. otherwise we'd have to make "validate" also async...!
  const schemas = {};
  const schemaRootDirPath = path.resolve(__dirname, './validationSchemas');
  glob.sync('./*.json', {cwd: schemaRootDirPath})
    .forEach(schemaFile => {
      const content = fs.readFileSync(path.join(schemaRootDirPath, schemaFile), 'utf-8');
      schemas[path.basename(schemaFile, '.json')] = JSON.parse(content);
    });

  return schemas;
}

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
tv4.addSchema(entitySchemas.labels);
tv4.addFormat('date', dateValidator);

function toMessage(validationResult) {
  const messageParts = validationResult.errors.map(error => {
    return `${error.message} (${error.dataPath}, ${error.schemaPath})`;
  });
  return messageParts.join(' | ');
}

function validate(schemaName, entity) {
  const schema = entitySchemas[schemaName];
  if (!schema) {
    throw new Error(`No Schema for ${schemaName}`);
  }

  const result = tv4.validateMultiple(entity, schema);
  if (!result.valid) {
    throw new Error(`${schemaName}: ${toMessage(result)}`);
  }
}

var dateValidator = function(data) {
  // test for Date object
  if (data && isDate(data)) {
    return null;
  }

  const dateTimeRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

  // test for ISO8601 date time string
  if (typeof data === 'string') {
    const matchesFormat = dateTimeRegex.test(data);
    const canParse = isNaN((new Date(data)).getTime());

    if (matchesFormat && canParse) {
      return null;
    }
  }

  return 'must be a date or an ISO8601 date signature';
};

export const validateBuild = validate.bind(undefined, 'build');
export const validateBranch = validate.bind(undefined, 'branch');
export const validateStep = validate.bind(undefined, 'step');
export const validateScenario = validate.bind(undefined, 'scenario');
export const validateUseCase = validate.bind(undefined, 'useCase');

export default {validateBuild, validateBranch, validateUseCase, validateStep, validateScenario, loadSchemas};
