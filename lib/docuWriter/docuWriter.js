var
  path = require('path'),
  _ = require('lodash'),
  utils = require('./util'),
  Q = require('q'),
  store = require('../scenariooStore'),
  identifierSanitizer = require('./identifierSanitizer'),
  entityValidator = require('./entityValidator'),
  xmlWriter = require('./xmlWriter'),
  pageNameExtractor = require('./pageNameExtractor'),
  screenshotSaver = require('./screenshotSaver');

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
 * Fetches the url and the htmlSource from the current page
 *
 * @ignore
 * @returns {Promise}
 */
function getStepDataFromWebpage() {
  return browser
    .getCurrentUrl()
    .then(function (currentUrl) {
      return element(by.css('body')).getOuterHtml()
        .then(function (pageHtmlSource) {
          return {url: currentUrl, source: pageHtmlSource};
        });
    });
}

function getPageNameFromUrl(urlString) {
  return identifierSanitizer.sanitize(pageNameExtractor.getPageNameFromUrl(urlString));
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 * @ignore
 */
function writeStepXml(stepName, currentScenario, absScenarioPath, additionalProperties) {

  return getStepDataFromWebpage()
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
          screenshotFileName: currentStepCounter + '.png'
        },
        html: {
          htmlSource: browserData.source
        },
        metadata: {}
      };

      // now let's add additional properties that were passed in by the developer
      if (additionalProperties && additionalProperties.details) {
        stepData.stepDescription.details = normalizeMetadataDetails(additionalProperties.details);
      }
      if (additionalProperties && additionalProperties.labels) {
        stepData.stepDescription.labels = additionalProperties.labels;
      }

      var xmlFileName = path.join(absScenarioPath, 'steps', currentStepCounter + '.xml');

      return xmlWriter.writeXmlFile('step', stepData, xmlFileName)
        .then(function () {
          return {
            file: xmlFileName,
            step: stepData
          };
        });
    });

}

/**
 * @namespace docuWriter
 */
var docuWriter = {

  buildOutputDir: undefined,

  /**
   * Use this to register your custom pageName function.
   * Scenarioo will pass in a node.js url object.
   *
   * @func docuWriter#registerPageNameFunction
   */
  registerPageNameFunction: function (pageNameFunction) {
    pageNameExtractor.registerCustomExtractionFunction(pageNameFunction);
  },

  /**
   * Initializes the writer and also saves the branch.xml file.
   * Is invoked by the reporter at the beginning of the test run
   *
   * @func docuWriter#start
   * @param {object} branch
   * @param {string} buildname
   * @param {string} scenariooTargetDirectory
   * @returns {Promise}
   */
  start: function (branch, buildname, scenariooTargetDirectory) {
    entityValidator.validateBranch(branch);
    this.branch = branch;
    this.branch.name = identifierSanitizer.sanitize(branch.name);

    var buildDirName = utils.encodeFileName(identifierSanitizer.sanitize(buildname));

    // generate directories and write branch.xml
    this.buildOutputDir = path.join(scenariooTargetDirectory, utils.encodeFileName(this.branch.name), buildDirName);
    return xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(scenariooTargetDirectory, utils.encodeFileName(this.branch.name)), 'branch.xml'));
  },

  /**
   * invoked by the jasmine reporter at the end of the test run
   * @func docuWriter#saveBuild
   * @param {object} build
   * @returns {Promise}
   */
  saveBuild: function (build) {
    entityValidator.validateBuild(build);
    build.name = identifierSanitizer.sanitize(build.name);
    return xmlWriter.writeXmlFile('build', build, path.join(this.buildOutputDir, 'build.xml'));
  },

  /**
   * Saves the given useCase to the scenarioo file structure.
   * Invoked by the reporter at the end of each use case.
   *
   * @func docuWriter#saveUseCase
   * @param {object} useCase
   * @returns {Promise}
   */
  saveUseCase: function (useCase) {
    if (_.isUndefined(this.buildOutputDir)) {
      throw 'Cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    // pick known attributes from given useCase object (user might choose to store other state on the usecase)
    var useCaseToSave = _.pick(useCase, ['name', 'description', 'status', 'labels', 'details']);
    entityValidator.validateUseCase(useCaseToSave);

    var absUseCasePath = path.resolve(this.buildOutputDir, utils.encodeFileName(useCaseToSave.name));
    useCase.name = identifierSanitizer.sanitize(useCaseToSave.name);
    return xmlWriter.writeXmlFile('useCase', useCaseToSave, path.join(absUseCasePath, 'usecase.xml'));
  },

  /**
   * Saves the given scenario according to the scenarioo file structure.
   * Invoked by the reporter at the end of each scenario.
   *
   * @func docuWriter#saveScenario
   * @param {object} currentScenario
   * @param {string} useCaseName
   * @returns {Promise}
   */
  saveScenario: function (currentScenario, useCaseName) {
    if (_.isUndefined(this.buildOutputDir)) {
      throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
    }

    // pick known attributes from given scenario object (user might choose to store other state on the scenario)
    var scenarioToSave = _.pick(currentScenario, ['name', 'description', 'status', 'labels', 'details']);
    entityValidator.validateScenario(scenarioToSave);

    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.encodeFileName(useCaseName),
      utils.encodeFileName(scenarioToSave.name));

    scenarioToSave.name = identifierSanitizer.sanitize(scenarioToSave.name);

    return xmlWriter.writeXmlFile('scenario', scenarioToSave, path.join(absScenarioPath, 'scenario.xml'));
  },

  /**
   * Saves a step (xml plus screenshot)
   * To be invoked in your e2e tests.
   *
   * @func docuWriter#saveStep
   * @param {string} stepName
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels]
   * @param {object} [additionalProperties.details]
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   */
  saveStep: function (stepName, additionalProperties) {
    // Because this is invoked by the e2e test,
    // we have to access the store directly from here.

    if (_.isUndefined(this.buildOutputDir)) {
      // if you disable scenario documentation generation (e.g. via environment variable in your protractor config)
      // this will still be invoked, since "saveStep(..)" is called from within your tests.
      // in this case, just do nothing.
      return Q.when(true);
    }

    var currentScenario = {
      useCaseName: store.getCurrentUseCase().name,
      scenarioName: store.getCurrentScenario().name,
      stepCounter: store.incrementStepCounter()
    };

    var absScenarioPath = path.resolve(this.buildOutputDir,
      utils.encodeFileName(currentScenario.useCaseName),
      utils.encodeFileName(currentScenario.scenarioName));


    var screenshotPromise = screenshotSaver.saveScreenshot(currentScenario.stepCounter, absScenarioPath);
    var stepXmlPromise = writeStepXml(stepName, currentScenario, absScenarioPath, additionalProperties);
    return Q.all([stepXmlPromise, screenshotPromise]).then(function (results) {
      return {
        step: results[0].step,
        xmlPath: results[0].file,
        screenshotPath: results[1]
      };
    });
  }

};

module.exports = docuWriter;
