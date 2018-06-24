'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _scenariooJs = require('./scenarioo-js');

var _scenariooJs2 = _interopRequireDefault(_scenariooJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Saves a step in your e2e tests.
 *
 * Use this decorator (http://www.typescriptlang.org/docs/handbook/decorators.html) this in your e2e test functions
 * whenever you want scenarioo to report a step based on a call of a function on a page object.
 *
 * @param {string} [description?] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
 * if not provided, it will use the following pattern: `{objectName}: {methodName}`.
 * @param {object} [additionalProperties]
 * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
 * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)
 */
function reportStep(description, additionalProperties) {
  return function (target, propertyKey, descriptor) {

    var originalMethod = descriptor.value;

    descriptor.value = function () {
      var stepDescription = description || target.constructor.name + ': ' + propertyKey;

      _scenariooJs2.default.saveStep(stepDescription, additionalProperties);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

exports.default = reportStep;