'use strict';

var
  fs = require('fs'),
  path = require('path'),
  utils = require('./../util'),
  pageNameExtractor = require('./pageNameExtractor'),
  identifierSanitizer = require('./identifierSanitizer'),
  entityValidator = require('./entityValidator'),
  xmlWriter = require('./xmlWriter'),
  mkdirp = require('mkdirp'),
  Q = require('q');


var ScenarioDocuWriter = {

  init: function (reporter, adapter) {
    this.reporter = reporter;
    this.adapter = adapter;
  },

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
   * @param {string} outputDirectory
   * @param {string} branchName
   * @param {string} buildName
   * @param {string} buildRevision
   * @returns {Promise} will resolve to the path of the created build directory
   */
  start: function (outputDirectory, branchName, buildName, buildRevision) {

    this.outputDirectory = outputDirectory;
    this.branchName = identifierSanitizer.sanitize(branchName);
    this.buildName = identifierSanitizer.sanitize(buildName);
    this.buildRevision = buildRevision;


    this.branchDirectoryName = utils.encodeFileName(this.branchName);
    this.buildDirectoryName = utils.encodeFileName(this.buildName);

    var absolutePathToBranch = path.join(path.resolve(this.outputDirectory), this.branchDirectoryName);
    var absolutePathToBuild = path.join(absolutePathToBranch, this.buildDirectoryName);


    var deferred = Q.defer();
    Q.nfcall(mkdirp, absolutePathToBuild)
      .then(function () {
        deferred.resolve(absolutePathToBuild);
      }, deferred.reject);
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
    entityValidator.validateBuild(build);
    build.name = identifierSanitizer.sanitize(build.name);

    if (this.buildRevision) {
      build.revision = this.buildRevision;
    }

    if (this.buildName !== build.name) {
      throw new Error('ScenarioDocuWriter was started with build name ' + this.buildName + ', but given build object has name ' + build.name);
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
   * To be invoked in your e2e tests to save a step.
   *
   * This method signature differs from it's java counterpart.
   * In jasmine/mocha, we don't want to (don't have to) specify the useCase and the scenario again.
   *
   * it's also the only function that is directly invoked by the user of scenarioo-js (within a e2e-spec).
   * The others are invoked via a reporter.
   */
  saveStep: function (stepDescription) {

    var self = this;
    var stepCounter = self.reporter.getAndIncrementStepCounter();
    var stepCounterString = utils.leadingZeros(stepCounter);
    var screenshotFileName = stepCounterString + '.png';
    var useCaseDirectoryName = utils.encodeFileName(self.reporter.getCurrentUseCaseName());
    var scenarioDirectoryName = utils.encodeFileName(self.reporter.getCurrentScenarioName());

    // augment the step with data from the current page, validate it and save the xml file
    var stepXmlPromise = this.adapter
      .getCurrentPageInformation()
      .then(function (pageInformation) {
        var stepXmlFileName = stepCounterString + '.xml';
        var step = {
          page: {
            name: identifierSanitizer.sanitize(pageNameExtractor.getPageNameFromUrl(pageInformation.url))
          },
          stepDescription: {
            index: stepCounter,
            screenshotFileName: screenshotFileName,
            title: stepDescription
          }
        };

        entityValidator.validateStep(step);

        var stepPath = path.join(path.resolve(self.outputDirectory), self.branchDirectoryName, self.buildDirectoryName, useCaseDirectoryName, scenarioDirectoryName, 'steps', stepXmlFileName);
        return xmlWriter.writeXmlFile('step', step, stepPath);

      });

    // get a screenshot from the current page and save it
    var screenshotPromise = this.adapter
      .getScreenshot()
      .then(function (data) {
        var deferredScreenshotSave = Q.defer();
        var screenShotDirPath = path.join(path.resolve(self.outputDirectory), self.branchDirectoryName, self.buildDirectoryName, useCaseDirectoryName, scenarioDirectoryName, 'screenshots');
        mkdirp(screenShotDirPath, function (err) {
          if (err) {
            deferredScreenshotSave.reject(err);
          }
          var fullFilePath = path.join(screenShotDirPath, screenshotFileName);
          fs.writeFile(fullFilePath, data, 'base64', function (saveFileError) {
            if (saveFileError) {
              deferredScreenshotSave.reject(saveFileError);
            } else {
              deferredScreenshotSave.resolve(fullFilePath);
            }
          });
        });
        return deferredScreenshotSave.promise;
      });

    return Q.all([stepXmlPromise, screenshotPromise]);
  }

};

module.exports = ScenarioDocuWriter;
