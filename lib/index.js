'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _scenariooJs = require('./scenarioo-js');

var _scenariooJs2 = _interopRequireDefault(_scenariooJs);

var _fluentDsl = require('./dsl/fluentDsl');

var fluentDsl = _interopRequireWildcard(_fluentDsl);

var _stepDecorator = require('./stepDecorator');

var _stepDecorator2 = _interopRequireDefault(_stepDecorator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// also expose the fluent dsl functions on `scenarioo` by default
// for working nicely with typescript typings
// and to be able to import it nicely from this library root.
_scenariooJs2.default.useCase = fluentDsl.useCase;
_scenariooJs2.default.scenario = fluentDsl.scenario;
_scenariooJs2.default.step = fluentDsl.step;
_scenariooJs2.default.fluentDslConfig = fluentDsl.config;

// expose reportStep on the scnearioo object as well.
_scenariooJs2.default.reportStep = _stepDecorator2.default;

// to support both module systems
exports.default = _scenariooJs2.default;

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
  module.exports = _scenariooJs2.default;
}