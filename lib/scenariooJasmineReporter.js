'use strict';

var ScenarioDocuWriter = require('./scenarioDocuWriter.js');
var path = require('path');

function ScenariooJasmineReporter(targetDirectory, branchName, branchDescription, buildName, revision) {
    this.targetDirecotry = targetDirectory;

    this.branch = {
        name: branchName,
        description: branchDescription
    };

    this.build = {
        name: buildName,
        revision: revision
    };
}

/**
 * inherit from jasmine reporter
 */
ScenariooJasmineReporter.prototype = new jasmine.Reporter();

/**
 * is invoked when runner is starting
 */
ScenariooJasmineReporter.prototype.reportRunnerStarting = function (runner) {

    var absoluteTargetDir = path.resolve(this.targetDirecotry);

    console.log('Reporting ' + runner.topLevelSuites().length + ' use cases for scenarioo. Writing to "' + absoluteTargetDir + '"');

    this.build.date = new Date().toISOString();

    ScenarioDocuWriter.start(this.branch, this.build, absoluteTargetDir);
};

jasmine.Reporter.prototype.reportSpecStarting = function (/*spec*/) {

};

ScenariooJasmineReporter.prototype.reportSuiteResults = function (suite) {
    var result = suite.results();
    console.log('useCase :: ' + suite.description + ' :: ' + (result.passed() ? 'passed' : 'failed'));
    var useCase = {
        name: suite.description,
        description: ''
    };
    ScenarioDocuWriter.saveUseCase(useCase);
};

/**
 * is invoked when runner is done (at the end of all use cases)
 */
ScenariooJasmineReporter.prototype.reportRunnerResults = function (runner) {
    var results = runner.results();
    console.log('All done! Failed: ' + results.failedCount + ', passed: ' + results.passedCount);
    this.build.status = (results.failedCount === 0) ? 'success' : 'fail';
    ScenarioDocuWriter.saveBuild(this.build);
};

/**
 * is invoked at the end of a spec (  the 'it()' functions )
 */
ScenariooJasmineReporter.prototype.reportSpecResults = function (spec) {
    var result = spec.results();
    console.log('scenario :: ' + spec.description + ' :: ' + (result.passed() ? 'passed' : 'failed'));
    var currentScenario = {
        useCaseName: spec.suite.description,
        scenarioName: spec.description,
        scenarioDescription: 'na',
        stepCounter: 0,
        status: result.passed() ? 'success' : 'fail'
    };

    ScenarioDocuWriter.saveScenario(currentScenario);
};

module.exports = ScenariooJasmineReporter;
