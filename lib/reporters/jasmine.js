'use strict';

var
  path = require('path'),
  util = require('util'),
  docuWriter = require('../scenarioo').docuWriter;

/**
 * @param {string} targetDirectory
 * @param {string} branch
 * @param {string} build
 * @param {string} revision
 * @constructor
 */
function ScenariooJasmineReporter(targetDirectory, branch, build, revision) {
  this.targetDirectory = targetDirectory;
  this.branch = branch;
  this.build = build;
  this.buildRevision = revision;
}

/**
 * inherit from jasmine reporter
 */
ScenariooJasmineReporter.prototype = new jasmine.Reporter();

/**
 * is invoked when runner is starting
 */
ScenariooJasmineReporter.prototype.reportRunnerStarting = function (runner) {

  var absoluteTargetDir = path.resolve(this.targetDirectory);

  console.log('Reporting ' + runner.topLevelSuites().length + ' use cases for scenarioo. Writing to "' + absoluteTargetDir + '"');

  docuWriter.start(absoluteTargetDir, this.branch, this.build, this.buildRevision);
};

/**
 * is invoked when runner is done (at the end of all use cases)
 */
ScenariooJasmineReporter.prototype.reportRunnerResults = function (runner) {
  var results = runner.results();
  console.log('All done! Failed: ' + results.failedCount + ', passed: ' + results.passedCount);
  var status = (results.failedCount === 0) ? 'success' : 'failed';
  docuWriter.saveBuild({
    name: this.build,
    status: status,
    date: new Date()
  });
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
    description: suite.scenariooMeta.useCaseDescription,
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
    description: spec.scenariooMeta.scenarioDescription,
    status: result.passed() ? 'success' : 'failed',
    labels: ['labelScOne', 'labelScTwo']
  });
};

function onInit(targetDirectory, branch, build, revision) {
  var reporterInstance = new ScenariooJasmineReporter(targetDirectory, branch, build, revision);
  require('jasmine-reporters');
  jasmine.getEnv().addReporter(reporterInstance);
}

function describeUseCase(useCaseName, useCaseDescription, callback) {
  describe(useCaseName, callback);
  jasmine.getEnv().currentSpec.suite.scenariooMeta = {
    useCaseDescription: useCaseDescription
  };
}

function describeScenario(scenarioName, scenarioDescription, callback) {
  it(scenarioName, callback);
  jasmine.getEnv().currentSpec.scenariooMeta = {
    scenarioDescription: scenarioDescription,
    stepCounter: 0
  };
}

function getAndIncrementStepCounter() {
  var meta = jasmine.getEnv().currentSpec.scenariooMeta;
  var oldCounter = meta.stepCounter;
  meta.stepCounter++;
  return oldCounter;
}

function getCurrentUseCaseName() {
  return jasmine.getEnv().currentSpec.suite.description;
}

function getCurrentScenarioName() {
  return jasmine.getEnv().currentSpec.description;
}

module.exports = {
  onInit: onInit,
  describeUseCase: describeUseCase,
  describeScenario: describeScenario,
  getAndIncrementStepCounter: getAndIncrementStepCounter,
  getCurrentUseCaseName: getCurrentUseCaseName,
  getCurrentScenarioName: getCurrentScenarioName
};
