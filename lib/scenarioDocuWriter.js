'use strict';

var path = require('path');
var utils = require('./util.js');
var xmlWriter = require('./xmlWriter.js');
var screenshotSaver = require('./screenshotSaver.js');


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
    preventRecording: false,

    start: function (branch, build, scenariooTargetDirectory, preventRecording) {
        this.preventRecording = preventRecording || false;

        if (this.preventRecording === true) {
            return;
        }

        this.branch = branch;
        this.build = build;
        this.targetDir = scenariooTargetDirectory;

        // generate basic directories and write branch.xml and build.xml
        this.buildOutputDir = path.join(this.targetDir, utils.getSafeForFileName(this.branch.name), utils.getSafeForFileName(this.build.name));
        xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, utils.getSafeForFileName(this.branch.name)), 'branch.xml'));
        xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));

    },

    saveUseCase: function (useCase) {
        if (this.preventRecording === true) {
            return;
        }

        var absUseCasePath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(useCase.name));
        writeUseCaseXml(useCase, absUseCasePath);
    },

    saveScenario: function (currentScenario) {
        if (this.preventRecording === true) {
            return;
        }

        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        writeScenarioXml(currentScenario, absScenarioPath);
    },

    saveStep: function (stepName) {
        if (this.preventRecording === true) {
            return;
        }

        var currentScenario = getCurrentScenario();
        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        writeStepXml(stepName, currentScenario, absScenarioPath);

        screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    }

};


module.exports = ScenarioDocuWriter;