'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveScreenshot = saveScreenshot;

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

exports.default = { saveScreenshot: saveScreenshot };