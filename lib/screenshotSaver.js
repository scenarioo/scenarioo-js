'use strict';

var
    fs = require('fs'),
    Q = require('q'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    utils = require('./util.js');

function saveScreenshot(currentScenario, absScenarioPath) {
    var screenShotDir = path.resolve(absScenarioPath, 'screenshots');
    var screenShotFileName = path.resolve(screenShotDir, utils.leadingZeros(currentScenario.stepCounter) + '.png');

    mkdirp.sync(screenShotDir);

    var deferred = Q.defer();
    browser.takeScreenshot()
        .then(function (data) {
            fs.writeFile(screenShotFileName, data, 'base64', function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(screenShotFileName);
                }
            });
        }, deferred.reject);

    return deferred.promise;
}


module.exports = {
    saveScreenshot: saveScreenshot
};
