"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _scenarioo = _interopRequireDefault(require("../scenarioo"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scenariooStep(description) {
  return function (target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;

    descriptor.value = function () {
      var stepDescription = description || "".concat(target.constructor.name, ": ").concat(propertyKey);

      _scenarioo.default.saveStep(stepDescription);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = originalMethod.apply(this, args);
      return result;
    };

    return descriptor;
  };
}

var _default = scenariooStep;
exports.default = _default;