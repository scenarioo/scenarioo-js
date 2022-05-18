"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.loadSchemas = loadSchemas;
exports.validateUseCase = exports.validateStep = exports.validateScenario = exports.validateBuild = exports.validateBranch = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _tv = _interopRequireDefault(require("tv4"));

var _glob = _interopRequireDefault(require("glob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var entitySchemas = loadSchemas();

function loadSchemas() {
  // load json files in-sync. otherwise we'd have to make "validate" also async...!
  var schemas = {};

  var schemaRootDirPath = _path["default"].resolve(__dirname, './validationSchemas');

  _glob["default"].sync('./*.json', {
    cwd: schemaRootDirPath
  }).forEach(function (schemaFile) {
    var content = _fs["default"].readFileSync(_path["default"].join(schemaRootDirPath, schemaFile), 'utf-8');

    schemas[_path["default"].basename(schemaFile, '.json')] = JSON.parse(content);
  });

  return schemas;
}
/**
 * add "mixins" to tv4 (they must have the "id" property set)
 * This is used for referencing via "$ref"
 */


_tv["default"].addSchema(entitySchemas.labels);

function toMessage(validationResult) {
  var messageParts = validationResult.errors.map(function (error) {
    return "".concat(error.message, " (").concat(error.dataPath, ", ").concat(error.schemaPath, ")");
  });
  return messageParts.join(' | ');
}

function validate(schemaName, entity) {
  var schema = entitySchemas[schemaName];

  if (!schema) {
    throw new Error("No Schema for ".concat(schemaName));
  }

  var result = _tv["default"].validateMultiple(entity, schema);

  if (!result.valid) {
    throw new Error("".concat(schemaName, ": ").concat(toMessage(result)));
  }
}

var validateBuild = validate.bind(undefined, 'build');
exports.validateBuild = validateBuild;
var validateBranch = validate.bind(undefined, 'branch');
exports.validateBranch = validateBranch;
var validateStep = validate.bind(undefined, 'step');
exports.validateStep = validateStep;
var validateScenario = validate.bind(undefined, 'scenario');
exports.validateScenario = validateScenario;
var validateUseCase = validate.bind(undefined, 'useCase');
exports.validateUseCase = validateUseCase;
var _default = {
  validateBuild: validateBuild,
  validateBranch: validateBranch,
  validateUseCase: validateUseCase,
  validateStep: validateStep,
  validateScenario: validateScenario,
  loadSchemas: loadSchemas
};
exports["default"] = _default;