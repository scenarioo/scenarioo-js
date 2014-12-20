'use strict';


var docuWriter = require('../scenarioDocuWriter');

/**
 * @param {string} targetDirectory
 * @param {object} branch
 * @param {object} build
 * @constructor
 */
function ScenariooJasmineReporter(targetDirectory, branch, build) {
  this.targetDirecotry = targetDirectory;
  this.branch = branch;
  this.build = build;
  this.build.date = new Date().toISOString();
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

  docuWriter.start(absoluteTargetDir, this.branch, this.build);
};


/**
 * is invoked when runner is done (at the end of all use cases)
 */
ScenariooJasmineReporter.prototype.reportRunnerResults = function (runner) {
  var results = runner.results();
  console.log('All done! Failed: ' + results.failedCount + ', passed: ' + results.passedCount);
  this.build.status = (results.failedCount === 0) ? 'success' : 'failed';
  docuWriter.saveBuild(this.build);
};


/**
 * is invoked at the end of a suite (  the 'describe()' functions )
 */
ScenariooJasmineReporter.prototype.reportSuiteResults = function (suite) {
  var result = suite.results();
  var logMessage = util.format('useCase :: %s :: %s (%d passed, %d failed)', suite.description, result.passed() ? 'passed' : 'failed', result.passedCount, result.failedCount);
  console.log(logMessage);

  docuWriter.saveUseCase({
    name: suite.description,
    description: 'use case description',
    status: (result.passed() ? 'success' : 'failed'),
    labels: ['labelUcOne', 'labelUcTwo']
  });

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

  docuWriter.saveScenario('Example UseCase', {
    name: spec.description,
    description: 'scenario description',
    status: result.passed() ? 'success' : 'failed',
    labels: ['labelScOne', 'labelScTwo']
  });
};

module.exports = ScenariooJasmineReporter;
