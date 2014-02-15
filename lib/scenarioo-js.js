/*
 * scenarioo-js
 * http://scenarioo.org
 *
 * Copyright (c) 2014 xeronimus
 * Licensed under the GNU GENERAL PUBLIC LICENSE.
 */

'use strict';

var ScenarioDocuWriter = require('./scenarioDocuWriter.js');
var ScenariooJasmineReporter = require('./scenariooJasmineReporter.js');

/**
 * registers the jasmine reporter
 */
var scenariooReporter = new ScenariooJasmineReporter();
jasmine.getEnv().addReporter(scenariooReporter);

var scenarioojs = {

    docuWriter: ScenarioDocuWriter,

    describeUseCase: function (useCaseName, callback) {
        describe(useCaseName, callback);
    },

    describeScenario: function (scenarioName, callback) {
        describe(scenarioName, function () {
            it('', callback);
        });
    }

};

module.exports = scenarioojs;