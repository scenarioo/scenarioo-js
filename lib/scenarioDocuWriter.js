/* scenarioo-client
 * Copyright (C) 2014, scenarioo.org Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var path = require('path');
var utils = require('./util.js');
var xmlWriter = require('./xmlWriter.js');
var screenshotSaver = require('./screenshotSaver.js');

/**
 * we save the step counter on the jasmine suite object.
 * this method returns the increased step counter.
 */
function increaseAndGetStepCounter() {
    var jasmineSuite = jasmine.getEnv().currentSpec.suite;
    if (utils.isDefined(jasmineSuite.scenariooStepCounter)) {
        jasmineSuite.scenariooStepCounter++;
    } else {
        jasmineSuite.scenariooStepCounter = 0;
    }
    return jasmineSuite.scenariooStepCounter;
}

/**
 * returns an object containing information about the current scenario
 */
function getCurrentScenario() {
    var jasmineSuite = jasmine.getEnv().currentSpec.suite;

    var currentScenario = {
        useCaseName: jasmineSuite.parentSuite.description,
        scenarioName: jasmineSuite.description,
        stepCounter: increaseAndGetStepCounter()
    };

    return currentScenario;
}

/**
 * writes scenario.xml to the configured output folder
 */
function writeScenarioXml(currentScenario, absScenarioPath) {
    var data = {
        name: utils.getSafeForFileName(currentScenario.scenarioName),
        description: 'na',
        status: 'success'
    };
    xmlWriter.writeXmlFile('scenario', data, path.join(absScenarioPath, 'scenario.xml'));
}

/**
 * writes useCase.xml to the configured output folder
 */
function writeUseCaseXml(useCase, absUseCasePath) {
    var data = {
        name: utils.getSafeForFileName(useCase.name),
        description: useCase.description,
        details: {}
    };
    xmlWriter.writeXmlFile('useCase', data, path.join(absUseCasePath, 'usecase.xml'));
}

/**
 * writes step xml file (000.xml, 001.xml, etc.)
 */
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
        this.branch = branch;
        this.build = build;
        this.targetDir = scenariooTargetDirectory;

        // generate directories and write branch.xml and build.xml
        this.buildOutputDir = path.join(this.targetDir, utils.getSafeForFileName(this.branch.name), utils.getSafeForFileName(this.build.name));
        xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, utils.getSafeForFileName(this.branch.name)), 'branch.xml'));
        xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));

    },

    /**
     * invoked by the jasmine reporter
     */
    saveUseCase: function (useCase) {
        var absUseCasePath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(useCase.name));
        writeUseCaseXml(useCase, absUseCasePath);
    },

    /**
     * invoked by the jasmine reporter
     */
    saveScenario: function (currentScenario) {
        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        writeScenarioXml(currentScenario, absScenarioPath);
    },

    /**
     * to be invoked by your e2e tests (protractor, jasmine)
     */
    saveStep: function (stepName) {
        var currentScenario = getCurrentScenario();
        var absScenarioPath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(currentScenario.useCaseName),
            utils.getSafeForFileName(currentScenario.scenarioName));

        writeStepXml(stepName, currentScenario, absScenarioPath);

        screenshotSaver.saveScreenshot(currentScenario, absScenarioPath);
    }

};


module.exports = ScenarioDocuWriter;