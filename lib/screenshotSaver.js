'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./util.js');
var directory = require('./directory.js');

function saveScreenshot(currentScenario, absScenarioPath) {
    if(typeof browser === 'undefined') {
        return;
    }
    browser.takeScreenshot().then(function (data) {
        var screenShotDir = path.resolve(absScenarioPath, 'screenshots');
        directory.mkdirSync(screenShotDir);
        fs.writeFile(path.resolve(screenShotDir, utils.leadingZeros(currentScenario.stepCounter) + '.png'), data, 'base64');
    });
}

var ScreenshoSaver = {
    saveScreenshot: saveScreenshot
};

module.exports = ScreenshoSaver;
