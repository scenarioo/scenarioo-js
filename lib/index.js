'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* scenarioo-js
                                                                                                                                                                                                                                                                               * Copyright (C) 2014, scenarioo.org Development Team
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * This program is free software: you can redistribute it and/or modify
                                                                                                                                                                                                                                                                               * it under the terms of the GNU General Public License as published by
                                                                                                                                                                                                                                                                               * the Free Software Foundation, either version 3 of the License, or
                                                                                                                                                                                                                                                                               * (at your option) any later version.
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * This program is distributed in the hope that it will be useful,
                                                                                                                                                                                                                                                                               * but WITHOUT ANY WARRANTY; without even the implied warranty of
                                                                                                                                                                                                                                                                               * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                                                                                                                                                                                                                                                                               * GNU General Public License for more details.
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * You should have received a copy of the GNU General Public License
                                                                                                                                                                                                                                                                               * along with this program.  If not, see <http://www.gnu.org/licenses/>.
                                                                                                                                                                                                                                                                               */

var _scenariooJs = require('./scenarioo-js');

var _scenariooJs2 = _interopRequireDefault(_scenariooJs);

var _fluentDsl = require('./dsl/fluentDsl');

var fluentDsl = _interopRequireWildcard(_fluentDsl);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// also expose the fluent dsl functions on `scenarioo` by default
// for working nicely with typescript typings
// and to be able to import it nicely from this library root.
_scenariooJs2.default.useCase = fluentDsl.useCase;
_scenariooJs2.default.scenario = fluentDsl.scenario;
_scenariooJs2.default.step = fluentDsl.step;
_scenariooJs2.default.fluentDslConfig = fluentDsl.config;

// to support both module systems
exports.default = _scenariooJs2.default;

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
  module.exports = _scenariooJs2.default;
}