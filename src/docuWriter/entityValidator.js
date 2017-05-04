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
  glob.sync('./**/*.json', {cwd: schemaRootDirPath})
    .forEach(schemaFile => {
      const content = fs.readFileSync(path.join(schemaRootDirPath, schemaFile), 'utf-8');
      const schema = JSON.parse(content);
      schemas[path.basename(schemaFile, '.json')] = schema;
      // add all schemas for reference in subschemas
      tv4.addSchema(schema);
    });
  return schemas;
}

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
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

  // serialize objects like dates
  const jsonEntity = JSON.parse(JSON.stringify(entity));

  const result = tv4.validateMultiple(jsonEntity, schema);
  if (!result.valid) {
    throw new Error(`${schemaName}: ${toMessage(result)}`);
  }
  if (result.missing && result.missing.length) {
    throw new Error(`Some referenced schema files are missing: ${result.missing}`);
  }
}

var dateValidator = function(data) {
  // test for Date object
  if (data && isDate(data)) {
    return null;
  }

  const dateTimeRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d(\.\d[3])?|Z)/;

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
