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

var _isDate = require('lodash/isDate');

var _isDate2 = _interopRequireDefault(_isDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var entitySchemas = loadSchemas();

function loadSchemas() {
  // load json files in-sync. otherwise we'd have to make "validate" also async...!
  var schemas = {};
  var schemaRootDirPath = _path2.default.resolve(__dirname, './validationSchemas');
  _glob2.default.sync('./**/*.json', { cwd: schemaRootDirPath }).forEach(function (schemaFile) {
    var content = _fs2.default.readFileSync(_path2.default.join(schemaRootDirPath, schemaFile), 'utf-8');
    var schema = JSON.parse(content);
    schemas[_path2.default.basename(schemaFile, '.json')] = schema;
    // add all schemas for reference in subschemas
    _tv2.default.addSchema(schema);
  });
  return schemas;
}

/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */
_tv2.default.addFormat('date', dateValidator);

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

  // serialize objects like dates
  var jsonEntity = JSON.parse(JSON.stringify(entity));

  var result = _tv2.default.validateMultiple(jsonEntity, schema);
  if (!result.valid) {
    throw new Error(schemaName + ': ' + toMessage(result));
  }
  if (result.missing && result.missing.length) {
    throw new Error('Some referenced schema files are missing: ' + result.missing);
  }
}

var dateValidator = function dateValidator(data) {
  // test for Date object
  if (data && (0, _isDate2.default)(data)) {
    return null;
  }

  var dateTimeRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d(\.\d[3])?|Z)/;

  // test for ISO8601 date time string
  if (typeof data === 'string') {
    var matchesFormat = dateTimeRegex.test(data);
    var canParse = isNaN(new Date(data).getTime());

    if (matchesFormat && canParse) {
      return null;
    }
  }

  return 'must be a date or an ISO8601 date signature';
};

var validateBuild = exports.validateBuild = validate.bind(undefined, 'build');
var validateBranch = exports.validateBranch = validate.bind(undefined, 'branch');
var validateStep = exports.validateStep = validate.bind(undefined, 'step');
var validateScenario = exports.validateScenario = validate.bind(undefined, 'scenario');
var validateUseCase = exports.validateUseCase = validate.bind(undefined, 'useCase');

exports.default = { validateBuild: validateBuild, validateBranch: validateBranch, validateUseCase: validateUseCase, validateStep: validateStep, validateScenario: validateScenario, loadSchemas: loadSchemas };