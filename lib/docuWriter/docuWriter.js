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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _utils = require('./utils');

var _scenariooStore = require('../scenariooStore');

var _scenariooStore2 = _interopRequireDefault(_scenariooStore);

var _identifierSanitizer = require('./identifierSanitizer');

var _identifierSanitizer2 = _interopRequireDefault(_identifierSanitizer);

var _entityValidator = require('./entityValidator');

var _entityValidator2 = _interopRequireDefault(_entityValidator);

var _xmlWriter = require('./xmlWriter');

var _xmlWriter2 = _interopRequireDefault(_xmlWriter);

var _pageNameExtractor = require('./pageNameExtractor');

var _pageNameExtractor2 = _interopRequireDefault(_pageNameExtractor);

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
 * Initializes the writer and also saves the branch.xml file.
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

  _entityValidator2.default.validateBranch(branch);
  this.branch = branch;
  this.branch.name = _identifierSanitizer2.default.sanitize(branch.name);

  var buildDirName = (0, _utils.encodeFileName)(_identifierSanitizer2.default.sanitize(buildname));

  // generate directories and write branch.xml
  buildOutputDir = _path2.default.join(scenariooTargetDirectory, (0, _utils.encodeFileName)(this.branch.name), buildDirName);

  return cleanBuildOnStartIfEnabled(buildOutputDir, options).then(function () {
    return _xmlWriter2.default.writeXmlFile('branch', _this.branch, _path2.default.resolve(_path2.default.join(scenariooTargetDirectory, (0, _utils.encodeFileName)(_this.branch.name)), 'branch.xml'));
  });
}

function cleanBuild(options) {
  var scenariooTargetDirectory = _path2.default.resolve(options.targetDirectory);
  var buildOutputDir = _path2.default.join(scenariooTargetDirectory, (0, _utils.encodeFileName)(_identifierSanitizer2.default.sanitize(options.branchName)), (0, _utils.encodeFileName)(_identifierSanitizer2.default.sanitize(options.buildName)));
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
  _entityValidator2.default.validateBuild(build);
  build.name = _identifierSanitizer2.default.sanitize(build.name);
  return _xmlWriter2.default.writeXmlFile('build', build, _path2.default.join(buildOutputDir, 'build.xml'));
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
  var useCaseToSave = (0, _pick2.default)(useCase, ['name', 'description', 'status', 'labels']);
  _entityValidator2.default.validateUseCase(useCaseToSave);

  var absUseCasePath = _path2.default.resolve(buildOutputDir, (0, _utils.encodeFileName)(useCaseToSave.name));
  useCase.name = _identifierSanitizer2.default.sanitize(useCaseToSave.name);
  return _xmlWriter2.default.writeXmlFile('useCase', useCaseToSave, _path2.default.join(absUseCasePath, 'usecase.xml'));
}

/**
 * Saves the given scenario according to the scenarioo file structure.
 * Invoked by the reporter at the end of each scenario.
 *
 * @func docuWriter#saveScenario
 * @param {object} currentScenario
 * @param {string} useCaseName
 * @returns {Promise}
 */
function saveScenario(currentScenario, useCaseName) {
  if ((0, _isUndefined2.default)(buildOutputDir)) {
    throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given scenario object (user might choose to store other state on the scenario)
  var scenarioToSave = (0, _pick2.default)(currentScenario, ['name', 'description', 'status', 'labels']);
  _entityValidator2.default.validateScenario(scenarioToSave);

  var absScenarioPath = _path2.default.resolve(buildOutputDir, (0, _utils.encodeFileName)(useCaseName), (0, _utils.encodeFileName)(scenarioToSave.name));

  scenarioToSave.name = _identifierSanitizer2.default.sanitize(scenarioToSave.name);

  return _xmlWriter2.default.writeXmlFile('scenario', scenarioToSave, _path2.default.join(absScenarioPath, 'scenario.xml'));
}

/**
 * Saves a step (xml plus screenshot)
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
 * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
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
    useCaseName: _scenariooStore2.default.getCurrentUseCase().name,
    scenarioName: _scenariooStore2.default.getCurrentScenario().name,
    stepCounter: _scenariooStore2.default.incrementStepCounter()
  };

  var absScenarioPath = _path2.default.resolve(buildOutputDir, (0, _utils.encodeFileName)(currentScenario.useCaseName), (0, _utils.encodeFileName)(currentScenario.scenarioName));

  var screenshotPromise = saveScreenshot(currentScenario.stepCounter, absScenarioPath);
  var stepXmlPromise = writeStepXml(stepTitle, currentScenario, absScenarioPath, additionalProperties);
  return _q2.default.all([stepXmlPromise, screenshotPromise]).then(function (results) {
    return {
      step: results[0].step,
      xmlPath: results[0].file,
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
  return _identifierSanitizer2.default.sanitize(_pageNameExtractor2.default.getPageNameFromUrl(urlString));
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
function writeStepXml(stepTitle, currentScenario, absScenarioPath, additionalProperties) {

  return getStepDataFromWebpage().then(function (browserData) {

    var currentStepCounter = (0, _utils.leadingZeros)(currentScenario.stepCounter);
    var pageName = getPageNameFromUrl(browserData.url);
    var stepData = {
      page: {
        name: pageName
      },
      stepDescription: {
        index: currentScenario.stepCounter,
        title: stepTitle,
        screenshotFileName: currentStepCounter + '.png'
      },
      html: {
        htmlSource: browserData.source
      },
      metadata: {
        visibleText: browserData.visibleText
      }
    };

    // now let's add additional properties that were passed in by the developer
    if (additionalProperties && additionalProperties.labels) {
      stepData.stepDescription.labels = additionalProperties.labels;
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

    var xmlFileName = _path2.default.join(absScenarioPath, 'steps', currentStepCounter + '.xml');

    return _xmlWriter2.default.writeXmlFile('step', stepData, xmlFileName).then(function () {
      return {
        file: xmlFileName,
        step: stepData
      };
    });
  });
}

function saveScreenshot(stepCounter, absScenarioPath) {
  var screenShotDir = _path2.default.resolve(absScenarioPath, 'screenshots');
  var screenShotFileName = _path2.default.resolve(screenShotDir, (0, _utils.leadingZeros)(stepCounter) + '.png');

  return browser.takeScreenshot().then(function (data) {
    return(
      // recursively create the directory for our new screenshot
      _q2.default.nfcall(_mkdirp2.default, screenShotDir).then(function () {
        return(
          // then save screenshot file
          _q2.default.nfcall(_fs2.default.writeFile, screenShotFileName, data, 'base64').then(function () {
            return screenShotFileName;
          })
        );
      })
    );
  });
}