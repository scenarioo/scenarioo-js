/* scenarioo-client
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


var ScenarioDocuWriter = require('./scenarioDocuWriter.js');
var path = require('path');

function ScenariooJasmineReporter() {
}

/**
 * returns true, if the given suite is a usecase.
 * in scenarioo, a useCase can have multiple scenarios.
 * A useCase is not within another 'describe' block.
 */
function isUseCase(suite) {
    return (suite.parentSuite === null);
}

/**
 * inherit from jasmine reporter
 */
ScenariooJasmineReporter.prototype = new jasmine.Reporter();

/**
 * is invoked when runner is starting
 */
ScenariooJasmineReporter.prototype.reportRunnerStarting = function (runner) {

    var suites = runner.topLevelSuites(), absoluteTargetDir = path.resolve(browser.params.scenariooTargetDirectory),
        preventRecording = !browser.params.recordUserScenarioDocu;

    console.log("Reporting " + suites.length + " use cases for scenarioo. Writing to '" + absoluteTargetDir + "'");

    // --- TODO:  take this from config, server, build, whatever...
    var branch = {
        name: 'example-branch',
        description: 'Just an example development branch'
    };
    var build = {
        name: 'example-build',
        revision: '123456',
        date: new Date().toString(),
        status: 'success'
    };


    ScenarioDocuWriter.start(branch, build, absoluteTargetDir, preventRecording);
};

jasmine.Reporter.prototype.reportSpecStarting = function (spec) {
    if (isUseCase(spec.suite)) {
        var useCase = {
            name: spec.suite.description,
            description: ''
        };
        ScenarioDocuWriter.saveUseCase(useCase);
    } else {
        var currentScenario = {
            useCaseName: spec.suite.parentSuite.description,
            scenarioName: spec.suite.description,
            stepCounter: 0
        };
        ScenarioDocuWriter.saveScenario(currentScenario);
    }
};

ScenariooJasmineReporter.prototype.reportSuiteResults = function (suite) {
    var result = suite.results();
    if (isUseCase(suite)) {
        // TODO: maybe update status in usecase.xml
        console.log("useCase :: " + suite.description + " :: " + (result.passed() ? "passed" : "failed"));
    } else {
        // TODO: maybe update status in scenario.xml
        console.log("scenario :: " + suite.description + " :: " + (result.passed() ? "passed" : "failed"));
    }
};

/**
 * is invoked when runner is done
 */
ScenariooJasmineReporter.prototype.reportRunnerResults = function (/*runner*/) {
};

/**
 * is invoked at the end of a spec (  the 'it()' functions )
 */
ScenariooJasmineReporter.prototype.reportSpecResults = function (/*spec*/) {
};

module.exports = ScenariooJasmineReporter;