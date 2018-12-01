"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveScreenshot = saveScreenshot;
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _q = _interopRequireDefault(require("q"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveScreenshot(stepCounter, absScenarioPath) {
  var screenShotDir = _path.default.resolve(absScenarioPath, 'screenshots');

  var screenShotFileName = _path.default.resolve(screenShotDir, (0, _utils.leadingZeros)(stepCounter) + '.png');

  return browser.takeScreenshot().then(function (data) {
    return (// recursively create the directory for our new screenshot
      _q.default.nfcall(_mkdirp.default, screenShotDir).then(function () {
        return (// then save screenshot file
          _q.default.nfcall(_fs.default.writeFile, screenShotFileName, data, 'base64').then(function () {
            return screenShotFileName;
          })
        );
      })
    );
  });
}

var _default = {
  saveScreenshot: saveScreenshot
};
exports.default = _default;