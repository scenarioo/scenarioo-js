import path from 'path';
import fs from 'fs';
import tv4 from 'tv4';
import glob from 'glob';

const entitySchemas = loadSchemas();

function loadSchemas() {
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

function toMessage(validationResult) {
  const messageParts = validationResult.errors.map(error => {
    return error.message + ' (' + error.dataPath + ', ' + error.schemaPath + ')';
  });
  return messageParts.join(' | ');
}

function validate(schemaName, entity) {
  const schema = entitySchemas[schemaName];
  if (!schema) {
    throw new Error('No Schema for ' + schemaName);
  }

  const result = tv4.validateMultiple(entity, schema);
  if (!result.valid) {
    throw new Error(schemaName + ': ' + toMessage(result));
  }
}

export const validateBuild = validate.bind(undefined, 'build');
export const validateBranch = validate.bind(undefined, 'branch');
export const validateStep = validate.bind(undefined, 'step');
export const validateScenario = validate.bind(undefined, 'scenario');
export const validateUseCase = validate.bind(undefined, 'useCase');

export default {validateBuild, validateBranch, validateUseCase, validateStep, validateScenario};
