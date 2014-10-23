'use strict';

var path = require('path');
var utils = require('./util.js');
var xmlWriter = require('./xmlWriter.js');
var screenshotSaver = require('./screenshotSaver.js');
var Q = require('q');

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
  xmlWriter.writeXmlFile('scenario', data, path.join(absScenarioPath, 'scenario.xml'));
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
  xmlWriter.writeXmlFile('useCase', data, path.join(absUseCasePath, 'usecase.xml'));
}


function getStepDataFromWebpage() {

  var deferred = Q.defer();

  if (typeof browser === 'undefined') {
    deferred.reject('browser is not defined');
  } else {
    browser.getCurrentUrl().then(function (currentUrl) {
        element(by.css('body')).getOuterHtml().then(function (pageHtmlSource) {
          deferred.resolve({url: currentUrl, source: pageHtmlSource});
        });
      }
    );
  }

  return deferred.promise;
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
function writeStepXml(stepName, currentScenario, absScenarioPath) {

  getStepDataFromWebpage().then(function (browserData) {
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

    xmlWriter.writeXmlFile('step', stepData, path.join(absScenarioPath, 'steps', currentStepCounter + '.xml'));
  }, function (err) {
    throw new Error(err);
  });
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
    xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, this.branch.name), 'branch.xml'));
  },

  saveBuild: function (build) {
    this.build = build;
    this.build.name = utils.getSafeForFileName(this.build.name);
    xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));
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
    writeUseCaseXml(useCase, absUseCasePath);
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

    writeScenarioXml(currentScenario, absScenarioPath);
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

    writeStepXml(stepName, currentScenario, absScenarioPath);

    screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
  }

};

module.exports = ScenarioDocuWriter;
