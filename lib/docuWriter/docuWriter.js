'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerPageNameFunction = registerPageNameFunction;
exports.start = start;
exports.cleanBuild = cleanBuild;
exports.saveBuild = saveBuild;
exports.saveUseCase = saveUseCase;
exports.saveScenario = saveScenario;
exports.saveStep = saveStep;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _utils = require('./utils');

var _scenariooStore = require('../scenariooStore');

var _scenariooStore2 = _interopRequireDefault(_scenariooStore);

var _identifierSanitizer = require('./identifierSanitizer');

var _entityValidator = require('./entityValidator');

var _entityValidator2 = _interopRequireDefault(_entityValidator);

var _pageNameExtractor = require('./pageNameExtractor');

var _pageNameExtractor2 = _interopRequireDefault(_pageNameExtractor);

var _fileSaver = require('./fileSaver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var buildOutputDir = void 0;

/**
 * @namespace docuWriter
 */
var docuWriter = {
  cleanBuild: cleanBuild,
  registerPageNameFunction: registerPageNameFunction,
  start: start,
  saveUseCase: saveUseCase,
  saveBuild: saveBuild,
  saveScenario: saveScenario,
  saveStep: saveStep
};

exports.default = docuWriter;

/**
 * Use this to register your custom pageName function.
 * Scenarioo will pass in a node.js url object.
 *
 * @func docuWriter#registerPageNameFunction
 */

function registerPageNameFunction(pageNameFunction) {
  _pageNameExtractor2.default.registerCustomExtractionFunction(pageNameFunction);
}

/**
 * Initializes the writer and also saves the branch.json file.
 * Is invoked by the reporter at the beginning of the test run
 *
 * @func docuWriter#start
 * @param {object} branch
 * @param {string} buildname
 * @param {string} scenariooTargetDirectory
 * @param {object} options
 * @returns {Promise}
 */
function start(branch, buildname, scenariooTargetDirectory, options) {
  var _this = this;

  this.branch = branch;
  this.branch.id = getId(branch);
  this.build = {
    name: buildname,
    id: (0, _identifierSanitizer.sanitizeForId)(buildname)
  };

  _entityValidator2.default.validateBranch(branch);
  // generate directories and write branch.json
  buildOutputDir = _path2.default.join(scenariooTargetDirectory, this.branch.id, this.build.id);

  return cleanBuildOnStartIfEnabled(buildOutputDir, options).then(function () {
    var branchFilePath = _path2.default.resolve(_path2.default.join(scenariooTargetDirectory, _this.branch.id, 'branch.json'));
    return (0, _fileSaver.saveJson)(branchFilePath, _this.branch);
  });
}

function cleanBuild(options) {
  var scenariooTargetDirectory = _path2.default.resolve(options.targetDirectory);
  var buildOutputDir = _path2.default.join(scenariooTargetDirectory, (0, _identifierSanitizer.sanitizeForId)(options.branchName), (0, _identifierSanitizer.sanitizeForId)(options.buildName));
  if (!options.disableScenariooLogOutput) {
    console.log('Cleaning build output directory for scenarioo documentation of this build: ' + buildOutputDir);
  }
  _del2.default.sync(buildOutputDir);
}

/**
 * cleans specified build directory if required by options
 *
 * @param buildOutputDir
 * @param options
 * @returns {Promise}
 */
function cleanBuildOnStartIfEnabled(buildOutputDir, options) {
  if (options && options.cleanBuildOnStart) {
    if (!options.disableScenariooLogOutput) {
      console.log('Cleaning build output directory for scenarioo documentation of this build: ' + buildOutputDir);
    }
    return (0, _del2.default)(buildOutputDir);
  } else {
    return _q2.default.when(true);
  }
}

/**
 * invoked by the jasmine reporter at the end of the test run
 * @func docuWriter#saveBuild
 * @param {object} build
 * @returns {Promise}
 */
function saveBuild(build) {
  build.id = getId(build);

  _entityValidator2.default.validateBuild(build);

  var buildFilePath = _path2.default.join(buildOutputDir, 'build.json');
  return (0, _fileSaver.saveJson)(buildFilePath, build);
}

/**
 * Saves the given useCase to the scenarioo file structure.
 * Invoked by the reporter at the end of each use case.
 *
 * @func docuWriter#saveUseCase
 * @param {object} useCase
 * @returns {Promise}
 */
function saveUseCase(useCase) {
  if ((0, _isUndefined2.default)(buildOutputDir)) {
    throw 'Cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given useCase object (user might choose to store other state on the usecase)
  var useCaseToSave = (0, _pick2.default)(useCase, ['id', 'name', 'description', 'status', 'labels']);

  useCaseToSave.id = getId(useCase);
  useCaseToSave.labels = (0, _identifierSanitizer.sanitizeLabels)(useCase.labels);

  _entityValidator2.default.validateUseCase(useCaseToSave);

  var absUseCasePath = _path2.default.resolve(buildOutputDir, useCaseToSave.id);
  var useCasePath = _path2.default.join(absUseCasePath, 'usecase.json');
  return (0, _fileSaver.saveJson)(useCasePath, useCaseToSave);
}

/**
 * Saves the given scenario according to the scenarioo file structure.
 * Invoked by the reporter at the end of each scenario.
 *
 * @func docuWriter#saveScenario
 * @param {object} currentScenario
 * @param {string} useCaseIdOrName
 * @returns {Promise}
 */
function saveScenario(currentScenario, useCaseIdOrName) {
  if ((0, _isUndefined2.default)(buildOutputDir)) {
    throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given scenario object (user might choose to store other state on the scenario)
  var scenarioToSave = (0, _pick2.default)(currentScenario, ['name', 'description', 'status', 'labels']);

  scenarioToSave.id = getId(scenarioToSave);
  scenarioToSave.labels = (0, _identifierSanitizer.sanitizeLabels)(scenarioToSave.labels);

  _entityValidator2.default.validateScenario(scenarioToSave);

  var useCaseId = (0, _identifierSanitizer.sanitizeForId)(useCaseIdOrName);

  var absScenarioPath = _path2.default.resolve(buildOutputDir, useCaseId, scenarioToSave.id);

  var scenarioPath = _path2.default.join(absScenarioPath, 'scenario.json');
  return (0, _fileSaver.saveJson)(scenarioPath, scenarioToSave);
}

/**
 * Saves a step (json plus screenshot plus html)
 *
 * This method can be used in protractor tests directly to define a step explicitly and will be invoked asynchronous in the event queue.
 * To be invoked in your e2e tests or in your page objects or somehow hooked into protractors click and other important interaction functions.
 *
 * @func docuWriter#saveStep
 * @param {string} [stepTitle] A text to display as caption for this step
 * @param {object} [additionalProperties]
 * @param {string[]} [additionalProperties.state]
 * @param {string[]} [additionalProperties.labels]
 * @param {object[]} [additionalProperties.screenAnnotations]
 * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step json file, the path to the html file as well as the path to the screenshot file
 */
function saveStep(stepTitle, additionalProperties) {
  if (!(0, _isString2.default)(stepTitle)) {
    additionalProperties = stepTitle;
    stepTitle = '';
  }

  // Because this is invoked by the e2e test,
  // we have to access the store directly from here.

  if ((0, _isUndefined2.default)(buildOutputDir)) {
    // if you disable scenario documentation generation (e.g. via environment variable in your protractor config)
    // this will still be invoked, since "saveStep(..)" is called from within your tests.
    // in this case, just do nothing.
    return _q2.default.when(true);
  }

  var currentScenario = {
    useCaseId: getId(_scenariooStore2.default.getCurrentUseCase()),
    scenarioId: getId(_scenariooStore2.default.getCurrentScenario()),
    stepCounter: _scenariooStore2.default.incrementStepCounter()
  };

  var absScenarioPath = _path2.default.resolve(buildOutputDir, currentScenario.useCaseId, currentScenario.scenarioId);

  var screenshotPromise = (0, _fileSaver.saveScreenshot)(currentScenario.stepCounter, absScenarioPath);
  var stepJsonPromise = writeStepJson(stepTitle, currentScenario, absScenarioPath, additionalProperties);
  return _q2.default.all([stepJsonPromise, screenshotPromise]).then(function (results) {
    return {
      step: results[0].step,
      jsonPath: results[0].file,
      htmlPath: results[0].htmlPath,
      screenshotPath: results[1]
    };
  });
}

/**
 * Fetches the url and the htmlSource from the current page
 *
 * @ignore
 * @returns {Promise}
 */
function getStepDataFromWebpage() {
  var currentUrlPromise = browser.getCurrentUrl();
  var htmlSourcePromise = browser.getPageSource();
  var visibleTextPromise = browser.findElement(by.css('body')).getText();

  return currentUrlPromise.then(function (currentUrl) {

    return htmlSourcePromise.then(function (htmlSource) {

      return visibleTextPromise.then(function (visibleText) {
        return {
          url: currentUrl,
          source: htmlSource,
          visibleText: visibleText
        };
      });
    });
  });
}

function getPageNameFromUrl(urlString) {
  return (0, _identifierSanitizer.sanitizeForName)(_pageNameExtractor2.default.getPageNameFromUrl(urlString));
}

/**
 * writes step JSON file (000.json, 001.json, etc.)
 */
function writeStepJson(stepTitle, currentScenario, absScenarioPath, additionalProperties) {

  return getStepDataFromWebpage().then(function (browserData) {

    // TODO:
    var stepId, pageId, stepProperties, pageLabels;

    var currentStepCounter = (0, _utils.leadingZeros)(currentScenario.stepCounter);
    // FIXME: pageName should be specifiable and only be inferred if not set
    var pageName = getPageNameFromUrl(browserData.url);
    var stepData = {
      index: currentScenario.stepCounter,
      id: stepId, // can be set by user to customize the url. Cannot be generated in this library if unset.
      title: stepTitle,
      // status added below
      page: {
        name: pageName,
        id: pageId || (0, _identifierSanitizer.sanitizeForId)(pageName),
        properties: stepProperties,
        labels: (0, _identifierSanitizer.sanitizeLabels)(pageLabels)
      },
      // TODO: step description missing?
      // TODO: how can we conveniently set these:
      sections: [],
      properties: []
    };

    // now let's add additional properties that were passed in by the developer
    if (additionalProperties && additionalProperties.labels) {
      var stepLabels = additionalProperties.labels;
      stepData.labels = (0, _identifierSanitizer.sanitizeLabels)(stepLabels);
    }
    if (additionalProperties && additionalProperties.screenAnnotations && (0, _isArray2.default)(additionalProperties.screenAnnotations)) {
      stepData.screenAnnotations = additionalProperties.screenAnnotations.map(function (annotation) {
        return (0, _merge2.default)({}, (0, _omit2.default)(annotation, ['x', 'y', 'width', 'height']), {
          region: (0, _pick2.default)(annotation, ['x', 'y', 'width', 'height'])
        });
      });
    }
    if (additionalProperties && additionalProperties.status) {
      stepData.stepDescription.status = additionalProperties.status;
    }

    var htmlSource = browserData.source;
    var jsonFileName = _path2.default.join(absScenarioPath, 'steps', currentStepCounter + '.json');

    var jsonPromise = (0, _fileSaver.saveJson)(jsonFileName, stepData);
    var htmlPromise = (0, _fileSaver.saveHtml)(currentScenario.stepCounter, absScenarioPath, htmlSource);
    return _q2.default.all([jsonPromise, htmlPromise]).then(function (results) {
      return {
        file: results[0].jsonFileName,
        step: results[0].stepData,
        htmlPath: results[1]
      };
    });
  });
}

function getId(scenarioObject) {
  return scenarioObject.id || (0, _identifierSanitizer.sanitizeForId)(scenarioObject.name);
}