'use strict';

var
  ScenarioDocuWriter = require('./scenarioDocuWriter.js'),
  util = require('util'),
  path = require('path');

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
  var logMessage = util.format('useCase :: %s :: %s (%d passed, %d failed)', suite.description, result.passed() ? 'passed' : 'failed', result.passedCount, result.failedCount);
  console.log(logMessage);
  var useCase = {
    name: suite.description,
    description: suite.scoUseCaseDescription,
    status: (result.passed() ? 'success' : 'fail')
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
  if (result.skipped === true) {
    console.log('scenario :: ' + spec.description + ' :: skipped!');
    return;
  }

  console.log('scenario :: ' + spec.description + ' :: ' + (result.passed() ? 'passed' : 'failed'));
  var currentScenario = {
    useCaseName: spec.suite.description,
    scenarioName: spec.description,
    scenarioDescription: spec.scoScenarioDescription,
    stepCounter: 0,
    status: result.passed() ? 'success' : 'fail'
  };

  ScenarioDocuWriter.saveScenario(currentScenario);
};

module.exports = ScenariooJasmineReporter;
