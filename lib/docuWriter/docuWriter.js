"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanBuild = cleanBuild;
exports["default"] = void 0;
exports.registerPageNameFunction = registerPageNameFunction;
exports.saveBuild = saveBuild;
exports.saveScenario = saveScenario;
exports.saveStep = saveStep;
exports.saveUseCase = saveUseCase;
exports.start = start;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _del = _interopRequireDefault(require("del"));

var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));

var _isArray = _interopRequireDefault(require("lodash/isArray"));

var _isString = _interopRequireDefault(require("lodash/isString"));

var _omit = _interopRequireDefault(require("lodash/omit"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _merge = _interopRequireDefault(require("lodash/merge"));

var _q = _interopRequireDefault(require("q"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _utils = require("./utils");

var _scenariooStore = _interopRequireDefault(require("../scenariooStore"));

var _identifierSanitizer = _interopRequireDefault(require("./identifierSanitizer"));

var _entityValidator = _interopRequireDefault(require("./entityValidator"));

var _xmlWriter = _interopRequireDefault(require("./xmlWriter"));

var _pageNameExtractor = _interopRequireDefault(require("./pageNameExtractor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var buildOutputDir;
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
var _default = docuWriter;
/**
 * Use this to register your custom pageName function.
 * Scenarioo will pass in a node.js url object.
 *
 * @func docuWriter#registerPageNameFunction
 */

exports["default"] = _default;

function registerPageNameFunction(pageNameFunction) {
  _pageNameExtractor["default"].registerCustomExtractionFunction(pageNameFunction);
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

  _entityValidator["default"].validateBranch(branch);

  this.branch = branch;
  this.branch.name = _identifierSanitizer["default"].sanitize(branch.name);
  var buildDirName = (0, _utils.encodeFileName)(_identifierSanitizer["default"].sanitize(buildname)); // generate directories and write branch.xml

  buildOutputDir = _path["default"].join(scenariooTargetDirectory, (0, _utils.encodeFileName)(this.branch.name), buildDirName);
  return cleanBuildOnStartIfEnabled(buildOutputDir, options).then(function () {
    return _xmlWriter["default"].writeXmlFile('branch', _this.branch, _path["default"].resolve(_path["default"].join(scenariooTargetDirectory, (0, _utils.encodeFileName)(_this.branch.name)), 'branch.xml'));
  });
}

function cleanBuild(options) {
  var scenariooTargetDirectory = _path["default"].resolve(options.targetDirectory);

  var buildOutputDir = _path["default"].join(scenariooTargetDirectory, (0, _utils.encodeFileName)(_identifierSanitizer["default"].sanitize(options.branchName)), (0, _utils.encodeFileName)(_identifierSanitizer["default"].sanitize(options.buildName)));

  if (!options.disableScenariooLogOutput) {
    console.log('Cleaning build output directory for scenarioo documentation of this build: ' + buildOutputDir);
  }

  _del["default"].sync(buildOutputDir);
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

    return (0, _del["default"])(buildOutputDir);
  } else {
    return _q["default"].when(true);
  }
}
/**
 * invoked by the jasmine reporter at the end of the test run
 * @func docuWriter#saveBuild
 * @param {object} build
 * @returns {Promise}
 */


function saveBuild(build) {
  _entityValidator["default"].validateBuild(build);

  build.name = _identifierSanitizer["default"].sanitize(build.name);
  return _xmlWriter["default"].writeXmlFile('build', build, _path["default"].join(buildOutputDir, 'build.xml'));
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
  if ((0, _isUndefined["default"])(buildOutputDir)) {
    throw 'Cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  } // pick known attributes from given useCase object (user might choose to store other state on the usecase)


  var useCaseToSave = (0, _pick["default"])(useCase, ['name', 'description', 'status', 'labels']);

  _entityValidator["default"].validateUseCase(useCaseToSave);

  var absUseCasePath = _path["default"].resolve(buildOutputDir, (0, _utils.encodeFileName)(useCaseToSave.name));

  useCase.name = _identifierSanitizer["default"].sanitize(useCaseToSave.name);
  return _xmlWriter["default"].writeXmlFile('useCase', useCaseToSave, _path["default"].join(absUseCasePath, 'usecase.xml'));
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
  if ((0, _isUndefined["default"])(buildOutputDir)) {
    throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  } // pick known attributes from given scenario object (user might choose to store other state on the scenario)


  var scenarioToSave = (0, _pick["default"])(currentScenario, ['name', 'description', 'status', 'labels']);

  _entityValidator["default"].validateScenario(scenarioToSave);

  var absScenarioPath = _path["default"].resolve(buildOutputDir, (0, _utils.encodeFileName)(useCaseName), (0, _utils.encodeFileName)(scenarioToSave.name));

  scenarioToSave.name = _identifierSanitizer["default"].sanitize(scenarioToSave.name);
  return _xmlWriter["default"].writeXmlFile('scenario', scenarioToSave, _path["default"].join(absScenarioPath, 'scenario.xml'));
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
  if (!(0, _isString["default"])(stepTitle)) {
    additionalProperties = stepTitle;
    stepTitle = '';
  } // Because this is invoked by the e2e test,
  // we have to access the store directly from here.


  if ((0, _isUndefined["default"])(buildOutputDir)) {
    // if you disable scenario documentation generation (e.g. via environment variable in your protractor config)
    // this will still be invoked, since "saveStep(..)" is called from within your tests.
    // in this case, just do nothing.
    return _q["default"].when(true);
  }

  var currentScenario = {
    useCaseName: _scenariooStore["default"].getCurrentUseCase().name,
    scenarioName: _scenariooStore["default"].getCurrentScenario().name,
    stepCounter: _scenariooStore["default"].incrementStepCounter()
  };

  var absScenarioPath = _path["default"].resolve(buildOutputDir, (0, _utils.encodeFileName)(currentScenario.useCaseName), (0, _utils.encodeFileName)(currentScenario.scenarioName));

  var screenshotPromise = saveScreenshot(currentScenario.stepCounter, absScenarioPath);
  var stepXmlPromise = writeStepXml(stepTitle, currentScenario, absScenarioPath, additionalProperties);
  return _q["default"].all([stepXmlPromise, screenshotPromise]).then(function (results) {
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
  return _identifierSanitizer["default"].sanitize(_pageNameExtractor["default"].getPageNameFromUrl(urlString));
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
        screenshotFileName: "".concat(currentStepCounter, ".png")
      },
      html: {
        htmlSource: browserData.source
      },
      metadata: {
        visibleText: browserData.visibleText
      }
    }; // now let's add additional properties that were passed in by the developer

    if (additionalProperties && additionalProperties.labels) {
      stepData.stepDescription.labels = additionalProperties.labels;
    }

    if (additionalProperties && additionalProperties.screenAnnotations && (0, _isArray["default"])(additionalProperties.screenAnnotations)) {
      stepData.screenAnnotations = additionalProperties.screenAnnotations.map(function (annotation) {
        return (0, _merge["default"])({}, (0, _omit["default"])(annotation, ['x', 'y', 'width', 'height']), {
          region: (0, _pick["default"])(annotation, ['x', 'y', 'width', 'height'])
        });
      });
    }

    if (additionalProperties && additionalProperties.status) {
      stepData.stepDescription.status = additionalProperties.status;
    }

    var xmlFileName = _path["default"].join(absScenarioPath, 'steps', currentStepCounter + '.xml');

    return _xmlWriter["default"].writeXmlFile('step', stepData, xmlFileName).then(function () {
      return {
        file: xmlFileName,
        step: stepData
      };
    });
  });
}

function saveScreenshot(stepCounter, absScenarioPath) {
  var screenShotDir = _path["default"].resolve(absScenarioPath, 'screenshots');

  var screenShotFileName = _path["default"].resolve(screenShotDir, (0, _utils.leadingZeros)(stepCounter) + '.png');

  return browser.takeScreenshot().then(function (data) {
    return (// recursively create the directory for our new screenshot
      _q["default"].nfcall(_mkdirp["default"], screenShotDir).then(function () {
        return (// then save screenshot file
          _q["default"].nfcall(_fs["default"].writeFile, screenShotFileName, data, 'base64').then(function () {
            return screenShotFileName;
          })
        );
      })
    );
  });
}