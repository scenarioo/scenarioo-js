/* scenarioo-js
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

var
  _ = require('lodash'),
  store = require('./scenariooStore'),
  docuWriter = require('./docuWriter/docuWriter.js');

function describeUseCase(jasmineDescribeFunction, useCaseName, useCaseDescription, callback) {
  if (_.isFunction(useCaseDescription)) {
    // if useCaseDescription is omitted (since optional)
    callback = useCaseDescription;
    useCaseDescription = '';
  }

  var jasmineSuite = jasmineDescribeFunction(useCaseName, callback);

  store.updateUseCase(jasmineSuite.id, {
    additionalDescription: useCaseDescription
  });
  return jasmineSuite;
}

function describeScenario(jasmineItFunction, scenarioName, scenarioDescription, callback) {
  if (_.isFunction(scenarioDescription)) {
    // if scenarioDescription is omitted (since optional)
    callback = scenarioDescription;
    scenarioDescription = '';
  }

  jasmineItFunction(scenarioName, callback);

  store.updateScenario(scenarioName, {
    additionalDescription: scenarioDescription
  });
}

var scenariooJs = {

  reporter: require('./scenariooJasmineReporter.js'),

  /**
   * Expose docuWriter's "saveStep" function.
   *
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @param {string} stepName
   * @param {object} details
   */
  saveStep: docuWriter.saveStep.bind(docuWriter),

  /**
   * @param {string} useCaseName
   * @param {string} [useCaseDescription] An optional description
   * @param {function} callback
   */
  describeUseCase: describeUseCase.bind(undefined, describe),

  /**
   * Used to run this use case exclusively (all use cases that are defined with fdescribe...)
   *
   * @param {string} useCaseName
   * @param {string} [useCaseDescription] An optional description
   * @param {function} callback
   */
  fdescribeUseCase: describeUseCase.bind(undefined, fdescribe),

  /**
   *
   * @param {string} scenarioName
   * @param {string} [scenarioDescription] An optional description
   * @param {function} callback
   */
  describeScenario: describeScenario.bind(undefined, it),

  /**
   * Used to run this use case exclusively (all scenarios that are defined with ddescribe...)
   *
   * @param {string} scenarioName
   * @param {string} [scenarioDescription] An optional description
   * @param {function} callback
   */
  fdescribeScenario: describeScenario.bind(undefined, fit)

};

module.exports = scenariooJs;
