'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _scenarioo = require('../scenarioo');

var _scenarioo2 = _interopRequireDefault(_scenarioo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scenariooStep(description) {
  return function (target, propertyKey, descriptor) {

    var originalMethod = descriptor.value;

    descriptor.value = function () {

      var stepDescription = description || target.constructor.name + ': ' + propertyKey;

      _scenarioo2.default.saveStep(stepDescription);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = originalMethod.apply(this, args);

      return result;
    };

    return descriptor;
  };
}

exports.default = scenariooStep;