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
  directory = require('./directory.js'),
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

  /**
   * Use this to register your custom pageName function.
   * Scenarioo will pass in a node.js url object.
   */
  registerPageNameFunction: function (pageNameFunction) {
    pageNameExtractor.registerCustomExtractionFunction(pageNameFunction);
  },

  /**
   * Will create base directory :  [target]/[branchname]/[buildname]
   * Invoke this via your specific report at the start of a test-run
   *
   * @param outputDirectory
   * @param {string} branchName
   * @param {string} buildName
   * @returns {Promise} will resolve to the path of the created build directory
   */
  start: function (outputDirectory, branchName, buildName) {

    this.outputDirectory = outputDirectory;
    this.branchName = identifierSanitizer.sanitize(branchName);
    this.buildName = identifierSanitizer.sanitize(buildName);


    this.branchDirectoryName = utils.encodeFileName(this.branchName);
    this.buildDirectoryName = utils.encodeFileName(this.buildName);

    var absolutePathToBranch = path.join(path.resolve(this.outputDirectory), this.branchDirectoryName);
    var absolutePathToBuild = path.join(absolutePathToBranch, this.buildDirectoryName);


    var deferred = Q.defer();
    directory.mkdir(absolutePathToBuild, function () {
      deferred.resolve(absolutePathToBuild);
    });
    return deferred.promise;
  },

  /**
   * Will create a branch.xml file
   *
   * @param {object} branch
   * @returns {Promise}  will resolve to the path of the created branch.xml file
   */
  saveBranch: function (branch) {
    entityValidator.validateBranch(branch);
    branch.name = identifierSanitizer.sanitize(branch.name);

    if (this.branchName !== branch.name) {
      throw new Error('ScenarioDocuWriter was started with branch name ' + this.branchName + ', but given branch object has name ' + branch.name);
    }

    return xmlWriter.writeXmlFile('branch', branch, path.join(path.resolve(this.outputDirectory), this.branchDirectoryName, 'branch.xml'));
  },

  /**
   * Will create a build.xml file
   *
   * @param {object} build
   * @returns {Promise}  will resolve to the path of the created build.xml file
   */
  saveBuild: function (build) {
    if (_.isDate(build.date)) {
      build.date = build.date.toISOString();
    }
    entityValidator.validateBuild(build);
    build.name = identifierSanitizer.sanitize(build.name);

    if (this.buildName !== build.name) {
      throw new Error('ScenarioDocuWriter was started with build name ' + this.buildName + ', but given branch object has name ' + build.name);
    }

    return xmlWriter.writeXmlFile('build', build, path.join(path.resolve(this.outputDirectory), this.branchDirectoryName, this.buildDirectoryName, 'build.xml'));
  },

  /**
   * Will create a usecase.xml file
   *
   * @param {object} useCase
   * @returns {Promise} will resolve to the path of the created usecase.xml file
   */
  saveUseCase: function (useCase) {
    entityValidator.validateUseCase(useCase);
    useCase.name = identifierSanitizer.sanitize(useCase.name);

    var useCaseDirectoryName = utils.encodeFileName(useCase.name);
    return xmlWriter.writeXmlFile('useCase', useCase, path.join(path.resolve(this.outputDirectory), this.branchDirectoryName, this.buildDirectoryName, useCaseDirectoryName, 'usecase.xml'));
  },

  /**
   * Will create a scenario.xml file
   *
   * @param {string} useCaseName
   * @param {object} scenario
   * @returns {Promise} will resolve to the path of the created scenario.xml file
   */
  saveScenario: function (useCaseName, scenario) {
    entityValidator.validateScenario(scenario);
    scenario.name = identifierSanitizer.sanitize(scenario.name);

    var useCaseDirectoryName = utils.encodeFileName(useCaseName);
    var scenarioDirectoryName = utils.encodeFileName(scenario.name);

    return xmlWriter.writeXmlFile('scenario', scenario, path.join(path.resolve(this.outputDirectory), this.branchDirectoryName, this.buildDirectoryName, useCaseDirectoryName, scenarioDirectoryName, 'scenario.xml'));
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
      utils.encodeFileName(currentScenario.useCaseName),
      utils.encodeFileName(currentScenario.scenarioName));


    var screenshotPromise = screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    var stepXmlPromise = writeStepXml(stepName, currentScenario, absScenarioPath, details);
    return Q.all([stepXmlPromise, screenshotPromise]);
  }

};

module.exports = ScenarioDocuWriter;
