import fs from 'fs';
import path from 'path';
import Q from 'q';
import mkdirp from 'mkdirp';
import { leadingZeros } from './utils';

export function saveScreenshot(stepCounter, absScenarioPath) {
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

export default {saveScreenshot};
