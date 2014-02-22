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
    var spec = jasmine.getEnv().currentSpec;
    if (utils.isDefined(spec.scenariooStepCounter)) {
        spec.scenariooStepCounter++;
    } else {
        spec.scenariooStepCounter = 0;
    }
    return spec.scenariooStepCounter;
}

/**
 * returns an object containing information about the current scenario
 */
function getCurrentScenario() {
    var spec = jasmine.getEnv().currentSpec, suite = spec.suite;

    var currentScenario = {
        useCaseName: suite.description,
        scenarioName: spec.description,
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
        description: currentScenario.scenarioDescription,
        status: currentScenario.status
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
                    screenshotFileName: currentStepCounter + '.png',
                    details: {}
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
        this.branch.name = utils.getSafeForFileName(this.branch.name);
        this.targetDir = scenariooTargetDirectory;
        build.name = utils.getSafeForFileName(build.name);

        // generate directories and write branch.xml
        this.buildOutputDir = path.join(this.targetDir, this.branch.name, build.name);
        xmlWriter.writeXmlFile('branch', this.branch, path.resolve(path.join(this.targetDir, this.branch.name), 'branch.xml'));
    },

    saveBuild: function (build) {
        this.build = build;
        this.build.name = utils.getSafeForFileName(this.build.name);
        xmlWriter.writeXmlFile('build', this.build, path.join(this.buildOutputDir, 'build.xml'));
    },

    /**
     * invoked by the jasmine reporter
     */
    saveUseCase: function (useCase) {
        if (!utils.isDefined(this.buildOutputDir)) {
            throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
        }

        var absUseCasePath = path.resolve(this.buildOutputDir,
            utils.getSafeForFileName(useCase.name));
        writeUseCaseXml(useCase, absUseCasePath);
    },

    /**
     * invoked by the jasmine reporter
     */
    saveScenario: function (currentScenario) {
        if (!utils.isDefined(this.buildOutputDir)) {
            throw 'cannot save use case. No outputDirectory specified. docuWriter.start(branch, build, targetDir) not invoked?';
        }

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