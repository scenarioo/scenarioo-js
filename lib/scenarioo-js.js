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

var
    _ = require('lodash'),
    ScenarioDocuWriter = require('./scenarioDocuWriter.js'),
    scenariooJasmineReporter = require('./scenariooJasmineReporter.js');


function describeUseCase(jasmineDescribeFunction, useCaseName, useCaseDescription, callback) {
    if (_.isFunction(useCaseDescription)) {
        // if useCaseDescription is omitted (since optional)
        callback = useCaseDescription;
        useCaseDescription = '';
    }

    var jasmineSuite = jasmineDescribeFunction(useCaseName, callback);
    jasmine.scoEnv.useCases[jasmineSuite.id] = {
        additionalDescription: useCaseDescription
    };
    return jasmineSuite;
}

function describeScenario(jasmineItFunction, scenarioName, scenarioDescription, callback) {
    if (_.isFunction(scenarioDescription)) {
        // if scenarioDescription is omitted (since optional)
        callback = scenarioDescription;
        scenarioDescription = '';
    }

    var jasmineSuite = describe('_' + scenarioName, function () {
        jasmineItFunction(scenarioName, callback);
    });
    // use the id of the parentSuite (useCase) to store custom description
    jasmine.scoEnv.scenarios[jasmineSuite.parentSuite.id] = {
        additionalDescription: scenarioDescription
    };
}

var scenariooJs = {

    reporter: scenariooJasmineReporter,
    docuWriter: ScenarioDocuWriter,

    /**
     * @param useCaseName
     * @param useCaseDescription (Optional)
     * @param callback
     * @param jasmineDescribeFunction
     * @returns {*}
     */
    describeUseCase: describeUseCase.bind(undefined, describe),

    ///**
    // * Used to run this use case exclusively (all use cases that are defined with ddescribe...)
    // */
    //ddescribeUseCase: _.partialRight(describeUseCase, describe),

    /**
     *
     * @param scenarioName
     * @param callback
     * @param jasmineItFunction
     * @returns {*}
     */
    describeScenario: describeScenario.bind(undefined, it)

    ///**
    // * Used to run this use case exclusively (all scenarios that are defined with ddescribe...)
    // */
    //ddescribeScenario: _.partialRight(describeScenario, iit)

};

module.exports = scenariooJs;
