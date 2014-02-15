'use strict';


var fs = require('fs');
var path = require('path');
var utils = require('./util.js');
var directory = require('./directory.js');
var xmlWriter = require('./xmlWriter.js');


function saveScreenshot(currentScenario, absScenarioPath) {
    browser.takeScreenshot().then(function (data) {
        fs.writeFile(path.resolve(absScenarioPath, 'screenshots', utils.leadingZeros(currentScenario.stepCounter) + '.png'), data, 'base64');
    });
}

function increaseAndGetStepCounter() {
    var jasmineSuite = jasmine.getEnv().currentSpec.suite;
    if (utils.isDefined(jasmineSuite.scenariooStepCounter)) {
        jasmineSuite.scenariooStepCounter++;
    } else {
        jasmineSuite.scenariooStepCounter = 0;
    }
    return jasmineSuite.scenariooStepCounter;
}

function getCurrentScenario() {
    var jasmineSuite = jasmine.getEnv().currentSpec.suite;

    var currentScenario = {
        useCaseName: jasmineSuite.parentSuite.description,
        scenarioName: jasmineSuite.description,
        stepCounter: increaseAndGetStepCounter()
    };

    return currentScenario;
}

function writeScenarioXml(currentScenario, absScenarioPath) {
    var data = {
        name: utils.getSafeForFileName(currentScenario.scenarioName),
        description: 'na',
        status: 'success'
    };
    xmlWriter.writeXmlFile('scenario', data, path.join(absScenarioPath, 'scenario.xml'));
}

function writeUseCaseXml(useCase, absUseCasePath) {
    var data = {
        name: utils.getSafeForFileName(useCase.name),
        description: useCase.description,
        details: {}
    };
    xmlWriter.writeXmlFile('useCase', data, path.join(absUseCasePath, 'usecase.xml'));
}

function writeStepXml(stepName, currentScenario, absScenarioPath) {

    // TODO wrap this in a function, return a promise
    // here:  getStepDataFromWebpage().then(function(currentUrl, source,..,...){
    //        }
    browser.getCurrentUrl().then(function (currentUrl) {
        element(by.css('body')).getOuterHtml().then(function (pageHtmlSource) {
            var currentStepCounter = utils.leadingZeros(currentScenario.stepCounter);
            var stepData = {
                page: {
                    name: currentUrl
                },
                stepDescription: {
                    index: currentScenario.stepCounter,
                    title: stepName,
                    status: 'success',
                    screenshotFileName: currentStepCounter + '.png',
                    details: {},
                    occurrence: 0,
                    relativeIndex: 0,
                    variantIndex: 0
                },
                html: {
                    htmlSource: pageHtmlSource
                },
                metadata: {
                    visibleText: '',
                    details: {}
                }
            };

            xmlWriter.writeXmlFile('step', stepData, path.join(absScenarioPath, 'steps', currentStepCounter + '.xml'));
        });
    });
}

var ScenarioDocuWriter = {

    targetDir: '',

    buildOutputDir: undefined,

    start: function (branch, build, scenariooTargetDirectory) {
        if (browser.params.recordUserScenarioDocu !== true) {
            return;
        }
        this.branch = branch;
        this.build = build;
        this.targetDir = scenariooTargetDirectory;

        // generate basic directories and write branch.xml and build.xml
        this.buildOutputDir = path.join(this.targetDir, utils.getSafeForFileName(this.branch.name), utils.getSafeForFileName(this.build.name));
        directory.mkdirSync(path.resolve(this.buildOutputDir));
        xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, utils.getSafeForFileName(this.branch.name)), 'branch.xml'));
        xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));

    },

    saveUseCase: function (useCase) {
        if (browser.params.recordUserScenarioDocu !== true) {
            return;
        }

        var absUseCasePath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(useCase.name));
        directory.mkdirSync(absUseCasePath);
        writeUseCaseXml(useCase, absUseCasePath);
    },

    saveScenario: function (currentScenario) {
        if (browser.params.recordUserScenarioDocu !== true) {
            return;
        }

        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        directory.mkdirSync(path.join(absScenarioPath, 'screenshots'));
        directory.mkdirSync(path.join(absScenarioPath, 'steps'));
        writeScenarioXml(currentScenario, absScenarioPath);
    },

    saveStep: function (stepName) {
        if (browser.params.recordUserScenarioDocu !== true) {
            return;
        }

        var currentScenario = getCurrentScenario();
        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        writeStepXml(stepName, currentScenario, absScenarioPath);

        saveScreenshot(currentScenario, absScenarioPath);
    }

};


module.exports = ScenarioDocuWriter;