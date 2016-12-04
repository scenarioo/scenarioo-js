'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateUseCase = exports.validateScenario = exports.validateStep = exports.validateBranch = exports.validateBuild = undefined;
exports.loadSchemas = loadSchemas;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tv = require('tv4');

var _tv2 = _interopRequireDefault(_tv);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var entitySchemas = loadSchemas();

function loadSchemas() {
  // load json files in-sync. otherwise we'd have to make "validate" also async...!
  var schemas = {};
  var schemaRootDirPath = _path2.default.resolve(__dirname, './validationSchemas');
  _glob2.default.sync('./*.json', { cwd: schemaRootDirPath }).forEach(function (schemaFile) {
    var content = _fs2.default.readFileSync(_path2.default.join(schemaRootDirPath, schemaFile), 'utf-8');
    schemas[_path2.default.basename(schemaFile, '.json')] = JSON.parse(content);
  });

  return schemas;
}

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
_tv2.default.addSchema(entitySchemas.labels);

function toMessage(validationResult) {
  var messageParts = validationResult.errors.map(function (error) {
    return error.message + ' (' + error.dataPath + ', ' + error.schemaPath + ')';
  });
  return messageParts.join(' | ');
}

function validate(schemaName, entity) {
  var schema = entitySchemas[schemaName];
  if (!schema) {
    throw new Error('No Schema for ' + schemaName);
  }

  var result = _tv2.default.validateMultiple(entity, schema);
  if (!result.valid) {
    throw new Error(schemaName + ': ' + toMessage(result));
  }
}

var validateBuild = exports.validateBuild = validate.bind(undefined, 'build');
var validateBranch = exports.validateBranch = validate.bind(undefined, 'branch');
var validateStep = exports.validateStep = validate.bind(undefined, 'step');
var validateScenario = exports.validateScenario = validate.bind(undefined, 'scenario');
var validateUseCase = exports.validateUseCase = validate.bind(undefined, 'useCase');

exports.default = { validateBuild: validateBuild, validateBranch: validateBranch, validateUseCase: validateUseCase, validateStep: validateStep, validateScenario: validateScenario, loadSchemas: loadSchemas };