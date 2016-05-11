'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveScreenshot = saveScreenshot;
exports.saveHtml = saveHtml;
exports.saveJson = saveJson;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HTML_DIRECTORY = 'html';
var SCREENSHOTS_DIRECTORY = 'screenshots';

function saveScreenshot(stepCounter, absScenarioPath) {
  // export screenshot to separate file screenshots/[stepCounter].png
  var screenShotDir = _path2.default.resolve(absScenarioPath, SCREENSHOTS_DIRECTORY);
  var screenShotPath = _path2.default.resolve(screenShotDir, (0, _utils.leadingZeros)(stepCounter) + '.png');

  return browser.takeScreenshot().then(function (data) {
    return(
      // recursively create the directory for our new screenshot
      createDirectires(screenShotDir).then(function () {
        return(
          // then save screenshot file
          saveFile(screenShotPath, data, 'base64').then(function () {
            return screenShotPath;
          })
        );
      })
    );
  });
}

function saveHtml(stepCounter, absScenarioPath, htmlSource) {
  // export html source to separate file html/[stepCounter].html
  var htmlDir = _path2.default.resolve(absScenarioPath, HTML_DIRECTORY);
  var htmlPath = _path2.default.resolve(htmlDir, (0, _utils.leadingZeros)(stepCounter) + '.html');

  // recursively create the directory for our new screenshot
  return createDirectires(htmlDir).then(function () {
    return(
      // then save screenshot file
      saveFile(htmlPath, htmlSource, 'UTF-8').then(function () {
        return htmlPath;
      })
    );
  });
}

function saveJson(filePath, data) {
  var directoryPath = _path2.default.dirname(_path2.default.resolve(filePath));

  return createDirectires(directoryPath).then(function () {
    return saveFile(filePath, JSON.stringify(data, null, 2), 'UTF-8');
  });
}

function createDirectires(directoryPath) {
  return _q2.default.nfcall(_mkdirp2.default, directoryPath);
}

function saveFile(filePath, data, options) {
  return _q2.default.nfcall(_fs2.default.writeFile, filePath, data, options);
}

exports.default = { saveScreenshot: saveScreenshot, saveHtml: saveHtml, saveJson: saveJson };