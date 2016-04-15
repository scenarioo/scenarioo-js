import path from 'path';
import fs from 'fs';
import del from 'del';

import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import merge from 'lodash/merge';

import Q from 'q';
import mkdirp from 'mkdirp';
import { leadingZeros, encodeFileName } from './utils';
import store from '../scenariooStore';
import identifierSanitizer from './identifierSanitizer';
import entityValidator from './entityValidator';
import xmlWriter from './xmlWriter';
import pageNameExtractor from './pageNameExtractor';


let buildOutputDir;

/**
 * @namespace docuWriter
 */
const docuWriter = {
  registerPageNameFunction,
  start,
  saveUseCase,
  saveBuild,
  saveScenario,
  saveStep
};

export default docuWriter;


/**
 * Use this to register your custom pageName function.
 * Scenarioo will pass in a node.js url object.
 *
 * @func docuWriter#registerPageNameFunction
 */
export function registerPageNameFunction(pageNameFunction) {
  pageNameExtractor.registerCustomExtractionFunction(pageNameFunction);
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
export function start(branch, buildname, scenariooTargetDirectory, options) {
  entityValidator.validateBranch(branch);
  this.branch = branch;
  this.branch.name = identifierSanitizer.sanitize(branch.name);

  const buildDirName = encodeFileName(identifierSanitizer.sanitize(buildname));

  // generate directories and write branch.xml
  buildOutputDir = path.join(scenariooTargetDirectory, encodeFileName(this.branch.name), buildDirName);

  return cleanBuildDirectory(buildOutputDir, options)
    .then(() => xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(scenariooTargetDirectory, encodeFileName(this.branch.name)), 'branch.xml')));
}

/**
 * cleans specified build directory if required by options
 *
 * @param buildOutputDir
 * @param options
 * @returns {Promise}
 */
function cleanBuildDirectory(buildOutputDir, options) {
  if (options && options.cleanBuildOnStart) {
    console.log('Cleaning build output directory for scenarioo documentation of this build: ' + buildOutputDir);
    return del(buildOutputDir);
  } else {
    return Q.when(true);
  }
}

/**
 * invoked by the jasmine reporter at the end of the test run
 * @func docuWriter#saveBuild
 * @param {object} build
 * @returns {Promise}
 */
export function saveBuild(build) {
  entityValidator.validateBuild(build);
  build.name = identifierSanitizer.sanitize(build.name);
  return xmlWriter.writeXmlFile('build', build, path.join(buildOutputDir, 'build.xml'));
}

/**
 * Saves the given useCase to the scenarioo file structure.
 * Invoked by the reporter at the end of each use case.
 *
 * @func docuWriter#saveUseCase
 * @param {object} useCase
 * @returns {Promise}
 */
export function saveUseCase(useCase) {
  if (isUndefined(buildOutputDir)) {
    throw 'Cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given useCase object (user might choose to store other state on the usecase)
  const useCaseToSave = pick(useCase, ['name', 'description', 'status', 'labels']);
  entityValidator.validateUseCase(useCaseToSave);

  const absUseCasePath = path.resolve(buildOutputDir, encodeFileName(useCaseToSave.name));
  useCase.name = identifierSanitizer.sanitize(useCaseToSave.name);
  return xmlWriter.writeXmlFile('useCase', useCaseToSave, path.join(absUseCasePath, 'usecase.xml'));
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
export function saveScenario(currentScenario, useCaseName) {
  if (isUndefined(buildOutputDir)) {
    throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given scenario object (user might choose to store other state on the scenario)
  const scenarioToSave = pick(currentScenario, ['name', 'description', 'status', 'labels']);
  entityValidator.validateScenario(scenarioToSave);

  const absScenarioPath = path.resolve(
    buildOutputDir,
    encodeFileName(useCaseName),
    encodeFileName(scenarioToSave.name)
  );

  scenarioToSave.name = identifierSanitizer.sanitize(scenarioToSave.name);

  return xmlWriter.writeXmlFile('scenario', scenarioToSave, path.join(absScenarioPath, 'scenario.xml'));
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
export function saveStep(stepTitle, additionalProperties) {
  if (!isString(stepTitle)) {
    additionalProperties = stepTitle;
    stepTitle = '';
  }

  // Because this is invoked by the e2e test,
  // we have to access the store directly from here.

  if (isUndefined(buildOutputDir)) {
    // if you disable scenario documentation generation (e.g. via environment variable in your protractor config)
    // this will still be invoked, since "saveStep(..)" is called from within your tests.
    // in this case, just do nothing.
    return Q.when(true);
  }

  const currentScenario = {
    useCaseName: store.getCurrentUseCase().name,
    scenarioName: store.getCurrentScenario().name,
    stepCounter: store.incrementStepCounter()
  };

  const absScenarioPath = path.resolve(
    buildOutputDir,
    encodeFileName(currentScenario.useCaseName),
    encodeFileName(currentScenario.scenarioName)
  );


  const screenshotPromise = saveScreenshot(currentScenario.stepCounter, absScenarioPath);
  const stepXmlPromise = writeStepXml(stepTitle, currentScenario, absScenarioPath, additionalProperties);
  return Q.all([stepXmlPromise, screenshotPromise]).then(results => {
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
  return browser
    .getCurrentUrl()
    .then(currentUrl => {

      return browser.getPageSource()
        .then(pageHtmlSource => {
          return {
            url: currentUrl,
            source: pageHtmlSource
          };
        });
    });
}

function getPageNameFromUrl(urlString) {
  return identifierSanitizer.sanitize(pageNameExtractor.getPageNameFromUrl(urlString));
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
function writeStepXml(stepTitle, currentScenario, absScenarioPath, additionalProperties) {

  return getStepDataFromWebpage()
    .then(browserData => {


      const currentStepCounter = leadingZeros(currentScenario.stepCounter);
      const pageName = getPageNameFromUrl(browserData.url);
      const stepData = {
        page: {
          name: pageName
        },
        stepDescription: {
          index: currentScenario.stepCounter,
          title: stepTitle,
          screenshotFileName: `${currentStepCounter}.png`
        },
        html: {
          htmlSource: browserData.source
        },
        metadata: {}
      };

      // now let's add additional properties that were passed in by the developer
      if (additionalProperties && additionalProperties.labels) {
        stepData.stepDescription.labels = additionalProperties.labels;
      }
      if (additionalProperties && additionalProperties.screenAnnotations && isArray(additionalProperties.screenAnnotations)) {
        stepData.screenAnnotations = additionalProperties.screenAnnotations.map(annotation => {
          return merge({},
            omit(annotation, ['x', 'y', 'width', 'height']),
            {
              region: pick(annotation, ['x', 'y', 'width', 'height'])
            });
        });
      }
      if (additionalProperties && additionalProperties.status) {
        stepData.stepDescription.status = additionalProperties.status;
      }

      const xmlFileName = path.join(absScenarioPath, 'steps', currentStepCounter + '.xml');

      return xmlWriter.writeXmlFile('step', stepData, xmlFileName)
        .then(() => {
          return {
            file: xmlFileName,
            step: stepData
          };
        });
    });

}

function saveScreenshot(stepCounter, absScenarioPath) {
  const screenShotDir = path.resolve(absScenarioPath, 'screenshots');
  const screenShotFileName = path.resolve(screenShotDir, leadingZeros(stepCounter) + '.png');

  return browser.takeScreenshot()
    .then(data => (
      // recursively create the directory for our new screenshot
      Q.nfcall(mkdirp, screenShotDir)
        .then(() => (
          // then save screenshot file
          Q.nfcall(fs.writeFile, screenShotFileName, data, 'base64')
            .then(() => screenShotFileName)
        ))
    ));
}

