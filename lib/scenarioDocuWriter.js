'use strict';

var
  path = require('path'),
  utils = require('./util'),
  _ = require('lodash'),
  xmlWriter = require('./xmlWriter'),
  pageNameExtractor = require('./pageNameExtractor'),
  screenshotSaver = require('./screenshotSaver'),
  Q = require('q');


function normalizeMetadataDetails(details) {
  if (_.isUndefined(details)) {
    return [];
  }
  if (_.isArray(details) || !_.isObject(details)) {
    throw new Error('Step metadata details must be an object!');
  }

  var mappedDetails = [];
  _.forEach(details, function (value, key) {
    mappedDetails.push({key: key, value: value});
  });

  return {entry: mappedDetails};
}

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
  var spec, suite;
  spec = jasmine.getEnv().currentSpec;
  suite = spec.suite;

  return {
    useCaseName: suite.description,
    scenarioName: spec.description,
    stepCounter: increaseAndGetStepCounter()
  };
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
    status: useCase.status,
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

function getPageNameFromUrl(urlString) {
  return utils.sanitizeIdentifier(pageNameExtractor.getPageNameFromUrl(urlString));
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
function writeStepXml(stepName, currentScenario, absScenarioPath, details) {
  var deferred = Q.defer();

  getStepDataFromWebpage()
    .then(function (browserData) {
      var currentStepCounter = utils.leadingZeros(currentScenario.stepCounter);
      var pageName = getPageNameFromUrl(browserData.url);
      var stepData = {
        page: {
          name: pageName
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
          details: normalizeMetadataDetails(details)
        }
      };

      var xmlFileName = path.join(absScenarioPath, 'steps', currentStepCounter + '.xml');

      xmlWriter
        .writeXmlFile('step', stepData, xmlFileName)
        .then(function () {
          deferred.resolve(stepData);
        }, deferred.reject);
    }, deferred.reject)
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

var ScenarioDocuWriter = {

  targetDir: '',

  buildOutputDir: undefined,

  /**
   * Use this to register your custom pageName function.
   * Scenarioo will pass in a node.js url object.
   */
  registerPageNameFunction: function (pageNameFunction) {
    pageNameExtractor.registerCustomExtractionFunction(pageNameFunction);
  },

  /**
   * Is invoked by the jasmine reporter at the beginning of the test run
   */
  start: function (branch, build, scenariooTargetDirectory) {
    this.branch = branch;
    this.branch.name = utils.getSafeForFileName(this.branch.name);
    this.targetDir = scenariooTargetDirectory;
    build.name = utils.getSafeForFileName(build.name);

    // generate directories and write branch.xml
    this.buildOutputDir = path.join(this.targetDir, this.branch.name, build.name);
    return xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, this.branch.name), 'branch.xml'));
  },

  /**
   * invoked by the jasmine reporter at the end of the test run
   */
  saveBuild: function (build) {
    this.build = build;
    this.build.name = utils.getSafeForFileName(this.build.name);
    return xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));
  },

  /**
   * invoked by the jasmine reporter at the end of each use case (jasmine suite)
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
   * invoked by the jasmine reporter at the end of each scenario (jasmine spec)
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
   * To be invoked in your e2e tests to save a step
   */
  saveStep: function (stepName, details) {
    if (!utils.isDefined(this.buildOutputDir)) {
      throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    var currentScenario = getCurrentScenario();
    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.getSafeForFileName(currentScenario.useCaseName),
      utils.getSafeForFileName(currentScenario.scenarioName));


    var screenshotPromise = screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    var stepXmlPromise = writeStepXml(stepName, currentScenario, absScenarioPath, details);
    return  Q.all([stepXmlPromise, screenshotPromise]);
  }

};

module.exports = ScenarioDocuWriter;
