import fs from 'fs';
import path from 'path';
import Q from 'q';
import mkdirp from 'mkdirp';
import { leadingZeros } from './utils';

const HTML_DIRECTORY = 'html';
const SCREENSHOTS_DIRECTORY = 'screenshots';


export function saveScreenshot(stepCounter, absScenarioPath) {
  // export screenshot to separate file screenshots/[stepCounter].png
  const screenShotDir = path.resolve(absScenarioPath, SCREENSHOTS_DIRECTORY);
  const screenShotPath = path.resolve(screenShotDir, leadingZeros(stepCounter) + '.png');

  return browser.takeScreenshot()
    .then(data => (
      // recursively create the directory for our new screenshot
      createDirectires(screenShotDir)
        .then(() => (
          // then save screenshot file
          saveFile(screenShotPath, data, 'base64')
            .then(() => screenShotPath)
        ))
    ));
}

export function saveHtml(stepCounter, absScenarioPath, htmlSource) {
  // export html source to separate file html/[stepCounter].html
  const htmlDir = path.resolve(absScenarioPath, HTML_DIRECTORY);
  const htmlPath = path.resolve(htmlDir, leadingZeros(stepCounter) + '.html');

  // recursively create the directory for our new screenshot
  return createDirectires(htmlDir)
    .then(() => (
      // then save screenshot file
      saveFile(htmlPath, htmlSource, 'UTF-8')
        .then(() => htmlPath)
    ));
}

export function saveJson(filePath, data) {
  const directoryPath = path.dirname(path.resolve(filePath));

  return createDirectires(directoryPath)
    .then(() => {
      return saveFile(filePath, JSON.stringify(data, null, 2), 'UTF-8')
        .then(() => ({
          jsonFileName: filePath,
          stepData: data
        }));
    });
}

function createDirectires(directoryPath) {
  return Q.nfcall(mkdirp, directoryPath);
}

function saveFile(filePath, data, options) {
  return Q.nfcall(fs.writeFile, filePath, data, options);
}


export default {saveScreenshot, saveHtml, saveJson};
