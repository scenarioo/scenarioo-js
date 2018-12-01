"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _scenariooJs = _interopRequireDefault(require("./scenarioo-js"));

var fluentDsl = _interopRequireWildcard(require("./dsl/fluentDsl"));

var _fluentDsl = require('./dsl/fluentDsl');

var fluentDsl = _interopRequireWildcard(_fluentDsl);

var _stepDecorator = require('./stepDecorator');

var _stepDecorator2 = _interopRequireDefault(_stepDecorator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// also expose the fluent dsl functions on `scenarioo` by default
// for working nicely with typescript typings
// and to be able to import it nicely from this library root.
_scenariooJs.default.useCase = fluentDsl.useCase;
_scenariooJs.default.scenario = fluentDsl.scenario;
_scenariooJs.default.step = fluentDsl.step;
_scenariooJs.default.fluentDslConfig = fluentDsl.config; // to support both module systems

// expose reportStep on the scnearioo object as well.
_scenariooJs2.default.reportStep = _stepDecorator2.default;

// to support both module systems
exports.default = _scenariooJs2.default;

if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
  module.exports = _scenariooJs.default;
}
