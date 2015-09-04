'use strict';

var
  path = require('path'),
  utils = require('./util'),
  identifierSanitizer = require('./identifierSanitizer'),
  entityValidator = require('./entityValidator'),
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
    name: identifierSanitizer.sanitize(currentScenario.name),
    description: currentScenario.description,
    status: currentScenario.status
  };
  return xmlWriter.writeXmlFile('scenario', data, path.join(absScenarioPath, 'scenario.xml'));
}

/**
 * writes useCase.xml to the configured output folder
 */
function writeUseCaseXml(useCase, absUseCasePath) {
  var data = {
    name: identifierSanitizer.sanitize(useCase.name),
    description: useCase.description,
    status: useCase.status
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
  return identifierSanitizer.sanitize(pageNameExtractor.getPageNameFromUrl(urlString));
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
  start: function (branch, buildname, scenariooTargetDirectory) {
    entityValidator.validateBranch(branch);
    this.branch = branch;
    this.branch.name = identifierSanitizer.sanitize(branch.name);
    this.targetDir = scenariooTargetDirectory;

    var buildDirName = utils.encodeFileName(identifierSanitizer.sanitize(buildname));

    // generate directories and write branch.xml
    this.buildOutputDir = path.join(this.targetDir, utils.encodeFileName(this.branch.name), buildDirName);
    return xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, utils.encodeFileName(this.branch.name)), 'branch.xml'));
  },

  /**
   * invoked by the jasmine reporter at the end of the test run
   */
  saveBuild: function (build) {
    entityValidator.validateBuild(build);
    build.name = identifierSanitizer.sanitize(build.name);
    return xmlWriter.writeXmlFile('build', build, path.join(this.buildOutputDir, 'build.xml'));
  },

  /**
   * invoked by the jasmine reporter at the end of each use case (jasmine suite)
   */
  saveUseCase: function (useCase) {
    if (!utils.isDefined(this.buildOutputDir)) {
      return; // this is allowed so that the web tests can be run without scenarioo documentation generation
    }

    entityValidator.validateUseCase(useCase);

    var absUseCasePath = path.resolve(this.buildOutputDir, utils.encodeFileName(useCase.name));
    useCase.name = identifierSanitizer.sanitize(useCase.name);
    return writeUseCaseXml(useCase, absUseCasePath);
  },

  /**
   * invoked by the jasmine reporter at the end of each scenario (jasmine spec)
   */
  saveScenario: function (currentScenario, useCaseName) {
    if (!utils.isDefined(this.buildOutputDir)) {
      return; // this is allowed so that the web tests can be run without scenarioo documentation generation
    }

    entityValidator.validateScenario(currentScenario);

    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.encodeFileName(useCaseName),
      utils.encodeFileName(currentScenario.name));

    currentScenario.name = identifierSanitizer.sanitize(currentScenario.name);
    return writeScenarioXml(currentScenario, absScenarioPath);
  },

  /**
   * To be invoked in your e2e tests to save a step
   */
  saveStep: function (stepName, details) {
    if (!utils.isDefined(this.buildOutputDir)) {
      return; // this is allowed so that the web tests can be run without scenarioo documentation generation
    }

    var currentScenario = getCurrentScenario();
    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.encodeFileName(currentScenario.useCaseName),
      utils.encodeFileName(currentScenario.scenarioName));


    var screenshotPromise = screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    var stepXmlPromise = writeStepXml(stepName, currentScenario, absScenarioPath, details);
    return Q.all([stepXmlPromise, screenshotPromise]);
  }

};

module.exports = ScenarioDocuWriter;
