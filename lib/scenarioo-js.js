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

'use strict';

var _ = require('lodash'),
  ScenarioDocuWriter = require('./scenarioDocuWriter.js'),
  ScenariooJasmineReporter = require('./scenariooJasmineReporter.js');


function describeUseCase(useCaseName, useCaseDescription, callback, jasmineDescribeFunction) {
  if (_.isFunction(useCaseDescription)) {
    jasmineDescribeFunction = callback;
    callback = useCaseDescription;
    useCaseDescription = '';
  }

  var jasmine = jasmineDescribeFunction(useCaseName, callback);
  jasmine.env.currentSpec.suite.scoUseCaseDescription = useCaseDescription;
  return jasmine;
}

function describeScenario(scenarioName, scenarioDescription, callback, jasmineItFunction) {
  if (_.isFunction(scenarioDescription)) {
    jasmineItFunction = callback;
    callback = scenarioDescription;
    scenarioDescription = '';
  }

  jasmineItFunction(scenarioName, callback);

  jasmine.getEnv().currentSpec.scoScenarioDescription = scenarioDescription;
}

var scenariooJs = {

  reporter: ScenariooJasmineReporter,
  docuWriter: ScenarioDocuWriter,

  /**
   * @param useCaseName
   * @param useCaseDescription (Optional)
   * @param callback
   * @param jasmineDescribeFunction
   * @returns {*}
   */
  describeUseCase: _.partialRight(describeUseCase, describe),

  /**
   * Used to run this use case exclusively (all use cases that are defined with ddescribe...)
   */
  ddescribeUseCase: _.partialRight(describeUseCase, ddescribe),

  /**
   *
   * @param scenarioName
   * @param callback
   * @param jasmineItFunction
   * @returns {*}
   */
  describeScenario: _.partialRight(describeScenario, it),

  /**
   * Used to run this use case exclusively (all scenarios that are defined with ddescribe...)
   */
  ddescribeScenario: _.partialRight(describeScenario, iit)

};

module.exports = scenariooJs;
