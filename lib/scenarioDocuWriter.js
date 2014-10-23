'use strict';

var
  path = require('path'),
  utils = require('./util.js'),
  xmlWriter = require('./xmlWriter.js'),
  screenshotSaver = require('./screenshotSaver.js'),
  Q = require('q');

/**
 * we save the step counter on the jasmine suite object.
 * this method returns the increased step counter.
 */
function increaseAndGetStepCounter() {
  var spec = jasmine.getEnv().currentSpec;
  if (utils.isDefined(spec.scenariooStepCounter)) {
    spec.scenariooStepCounter++;
  } else {
    spec.scenariooStepCounter = 0;
  }
  return spec.scenariooStepCounter;
}

/**
 * returns an object containing information about the current scenario
 */
function getCurrentScenario() {
  var spec , suite;
  spec = jasmine.getEnv().currentSpec;
  suite = spec.suite;

  var currentScenario = {
    useCaseName: suite.description,
    scenarioName: spec.description,
    stepCounter: increaseAndGetStepCounter()
  };

  return currentScenario;
}

/**
 * writes scenario.xml to the configured output folder
 */
function writeScenarioXml(currentScenario, absScenarioPath) {
  var data = {
    name: utils.getSafeForFileName(currentScenario.scenarioName),
    description: currentScenario.scenarioDescription,
    status: currentScenario.status
  };
  return xmlWriter.writeXmlFile('scenario', data, path.join(absScenarioPath, 'scenario.xml'));
}

/**
 * writes useCase.xml to the configured output folder
 */
function writeUseCaseXml(useCase, absUseCasePath) {
  var data = {
    name: utils.getSafeForFileName(useCase.name),
    description: useCase.description,
    details: {}
  };
  return xmlWriter.writeXmlFile('useCase', data, path.join(absUseCasePath, 'usecase.xml'));
}


function getStepDataFromWebpage() {

  var deferred = Q.defer();

  browser
    .getCurrentUrl()
    .then(function (currentUrl) {
      element(by.css('body')).getOuterHtml().then(function (pageHtmlSource) {
        deferred.resolve({url: currentUrl, source: pageHtmlSource});
      }, deferred.reject);
    }, deferred.reject);

  return deferred.promise;
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
function writeStepXml(stepName, currentScenario, absScenarioPath) {
  var deferred = Q.defer();

  getStepDataFromWebpage()
    .then(function (browserData) {
      var currentStepCounter = utils.leadingZeros(currentScenario.stepCounter);
      var stepData = {
        page: {
          name: utils.sanitizeIdentifier(browserData.url)
        },
        stepDescription: {
          index: currentScenario.stepCounter,
          title: stepName,
          screenshotFileName: currentStepCounter + '.png',
          details: {}
        },
        html: {
          htmlSource: browserData.source
        },
        metadata: {
          visibleText: '',
          details: {}
        }
      };

      var xmlFileName = path.join(absScenarioPath, 'steps', currentStepCounter + '.xml');

      xmlWriter
        .writeXmlFile('step', stepData, xmlFileName)
        .then(deferred.resolve, deferred.reject);
    }, deferred.reject);

  return deferred.promise;
}

var ScenarioDocuWriter = {

  targetDir: '',

  buildOutputDir: undefined,

  start: function (branch, build, scenariooTargetDirectory) {
    this.branch = branch;
    this.branch.name = utils.getSafeForFileName(this.branch.name);
    this.targetDir = scenariooTargetDirectory;
    build.name = utils.getSafeForFileName(build.name);

    // generate directories and write branch.xml
    this.buildOutputDir = path.join(this.targetDir, this.branch.name, build.name);
    return xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, this.branch.name), 'branch.xml'));
  },

  saveBuild: function (build) {
    this.build = build;
    this.build.name = utils.getSafeForFileName(this.build.name);
    return xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));
  },

  /**
   * invoked by the jasmine reporter
   */
  saveUseCase: function (useCase) {
    if (!utils.isDefined(this.buildOutputDir)) {
      throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    var absUseCasePath = path.resolve(this.buildOutputDir,
      utils.getSafeForFileName(useCase.name));
    return writeUseCaseXml(useCase, absUseCasePath);
  },

  /**
   * invoked by the jasmine reporter
   */
  saveScenario: function (currentScenario) {
    if (!utils.isDefined(this.buildOutputDir)) {
      throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.getSafeForFileName(currentScenario.useCaseName),
      utils.getSafeForFileName(currentScenario.scenarioName));

    return writeScenarioXml(currentScenario, absScenarioPath);
  },

  /**
   * to be invoked by your e2e tests (protractor, jasmine)
   */
  saveStep: function (stepName) {
    if (!utils.isDefined(this.buildOutputDir)) {
      throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    var currentScenario = getCurrentScenario();
    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.getSafeForFileName(currentScenario.useCaseName),
      utils.getSafeForFileName(currentScenario.scenarioName));


    var screenshotPromise = screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    var stepXmlPromise = writeStepXml(stepName, currentScenario, absScenarioPath);
    return Q.all([screenshotPromise, stepXmlPromise]);
  }

};

module.exports = ScenarioDocuWriter;
