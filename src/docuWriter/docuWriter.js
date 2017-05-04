import path from 'path';
import del from 'del';

import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import merge from 'lodash/merge';

import Q from 'q';
import { leadingZeros } from './utils';
import store from '../scenariooStore';
import { sanitizeForId, sanitizeLabels, sanitizeForName } from './identifierSanitizer';
import entityValidator from './entityValidator';
import pageNameExtractor from './pageNameExtractor';

import { saveScreenshot, saveHtml, saveJson } from './fileSaver';

let buildOutputDir;

/**
 * @namespace docuWriter
 */
const docuWriter = {
  cleanBuild,
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
export function start(branch, buildname, scenariooTargetDirectory, options) {
  this.branch = branch;
  this.branch.id = getId(branch);
  this.build = {
    name: buildname,
    id: sanitizeForId(buildname)
  };

  entityValidator.validateBranch(branch);
  // generate directories and write branch.json
  buildOutputDir = path.join(scenariooTargetDirectory, this.branch.id, this.build.id);

  return cleanBuildOnStartIfEnabled(buildOutputDir, options)
    .then(() => {
      const branchFilePath = path.resolve(path.join(scenariooTargetDirectory, this.branch.id, 'branch.json'));
      return saveJson(branchFilePath, this.branch);
    });
}

export function cleanBuild(options) {
  var scenariooTargetDirectory = path.resolve(options.targetDirectory);
  var buildOutputDir = path.join(scenariooTargetDirectory, sanitizeForId(options.branchName), sanitizeForId(options.buildName));
  if (!options.disableScenariooLogOutput) {
    console.log('Cleaning build output directory for scenarioo documentation of this build: ' + buildOutputDir);
  }
  del.sync(buildOutputDir);
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
  build.id = getId(build);

  entityValidator.validateBuild(build);

  const buildFilePath = path.join(buildOutputDir, 'build.json');
  return saveJson(buildFilePath, build);
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
  const useCaseToSave = pick(useCase, ['id', 'name', 'description', 'status', 'labels']);

  useCaseToSave.id = getId(useCase);
  useCaseToSave.labels = sanitizeLabels(useCase.labels);

  entityValidator.validateUseCase(useCaseToSave);

  const absUseCasePath = path.resolve(buildOutputDir, useCaseToSave.id);
  const useCasePath = path.join(absUseCasePath, 'usecase.json');
  return saveJson(useCasePath, useCaseToSave);
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
export function saveScenario(currentScenario, useCaseIdOrName) {
  if (isUndefined(buildOutputDir)) {
    throw 'Cannot save use scenario. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
  }

  // pick known attributes from given scenario object (user might choose to store other state on the scenario)
  const scenarioToSave = pick(currentScenario, ['name', 'description', 'status', 'labels']);

  scenarioToSave.id = getId(scenarioToSave);
  scenarioToSave.labels = sanitizeLabels(scenarioToSave.labels);

  entityValidator.validateScenario(scenarioToSave);

  const useCaseId = sanitizeForId(useCaseIdOrName);

  const absScenarioPath = path.resolve(
    buildOutputDir,
    useCaseId,
    scenarioToSave.id
  );

  const scenarioPath = path.join(absScenarioPath, 'scenario.json');
  return saveJson(scenarioPath, scenarioToSave);
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
    useCaseId: getId(store.getCurrentUseCase()),
    scenarioId: getId(store.getCurrentScenario()),
    stepCounter: store.incrementStepCounter()
  };

  const absScenarioPath = path.resolve(
    buildOutputDir,
    currentScenario.useCaseId,
    currentScenario.scenarioId
  );

  const screenshotPromise = saveScreenshot(currentScenario.stepCounter, absScenarioPath);
  const stepJsonPromise = writeStepJson(stepTitle, currentScenario, absScenarioPath, additionalProperties);
  return Q.all([stepJsonPromise, screenshotPromise]).then(results => {
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

  return currentUrlPromise
    .then(currentUrl => {

      return htmlSourcePromise
        .then(htmlSource => {

          return visibleTextPromise
            .then(visibleText => {
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
  return sanitizeForName(pageNameExtractor.getPageNameFromUrl(urlString));
}

/**
 * writes step JSON file (000.json, 001.json, etc.)
 */
function writeStepJson(stepTitle, currentScenario, absScenarioPath, additionalProperties) {

  return getStepDataFromWebpage()
    .then(browserData => {

      // TODO:
      var stepId, pageId, stepProperties, pageLabels;

      const currentStepCounter = leadingZeros(currentScenario.stepCounter);
      // FIXME: pageName should be specifiable and only be inferred if not set
      const pageName = getPageNameFromUrl(browserData.url);
      const stepData = {
        index: currentScenario.stepCounter,
        id: stepId, // can be set by user to customize the url. Cannot be generated in this library if unset.
        title: stepTitle,
        // status added below
        page: {
          name: pageName,
          id: pageId || sanitizeForId(pageName),
          properties: stepProperties,
          labels: sanitizeLabels(pageLabels)
        },
        // TODO: step description missing?
        // TODO: how can we conveniently set these:
        sections: [],
        properties: []
      };

      // now let's add additional properties that were passed in by the developer
      if (additionalProperties && additionalProperties.labels) {
        const stepLabels = additionalProperties.labels;
        stepData.labels = sanitizeLabels(stepLabels);
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

      const htmlSource = browserData.source;
      const jsonFileName = path.join(absScenarioPath, 'steps', currentStepCounter + '.json');

      const jsonPromise = saveJson(jsonFileName, stepData);
      const htmlPromise = saveHtml(currentScenario.stepCounter, absScenarioPath, htmlSource);
      return Q.all([jsonPromise, htmlPromise])
          .then((results) => {
            return {
              file: results[0].jsonFileName,
              step: results[0].stepData,
              htmlPath: results[1]
            };
          });
    });
}

function getId(scenarioObject) {
  return scenarioObject.id || sanitizeForId(scenarioObject.name);
}
