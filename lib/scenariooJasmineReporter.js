'use strict';

var
    util = require('util'),
    path = require('path'),
    ScenarioDocuWriter = require('./scenarioDocuWriter.js');

function ScenariooJasmineReporter(targetDirectory, branchName, branchDescription, buildName, revision) {

    var scoEnv = {
        branch: {
            name: branchName,
            description: branchDescription
        },
        build: {
            name: buildName,
            revision: revision,
            passedUseCases: 0,
            failedUseCases: 0
        },
        useCases: {},
        scenarios: {},
        currentUseCase: undefined,
        currentScenario: undefined
    };

    // expose our scenario environment to the global jasmine variable. so that the docuWriter can access this information
    jasmine.scoEnv = scoEnv;

    return {
        jasmineStarted: jasmineStarted,
        suiteStarted: suiteStarted,
        specStarted: specStarted,
        specDone: specDone,
        suiteDone: suiteDone,
        jasmineDone: jasmineDone
    };

    /**
     * is invoked when runner is starting
     */
    function jasmineStarted(runner) {
        var absoluteTargetDir = path.resolve(targetDirectory);
        console.log('Reporting ' + runner.totalSpecsDefined + ' scenarios for scenarioo. Writing to "' + absoluteTargetDir + '"');
        scoEnv.build.date = new Date().toISOString();
        ScenarioDocuWriter.start(scoEnv.branch, scoEnv.build.name, absoluteTargetDir);
    }

    /**
     * is invoked when a suite is starting (i.e. for every use case)
     * @param suite
     */
    function suiteStarted(suite) {
        if (!scoEnv.currentUseCase) {
            suite.isUseCase = true;
            scoEnv.currentUseCase = suite;
            scoEnv.useCases[suite.id].passedScenarios = 0;
            scoEnv.useCases[suite.id].failedScenarios = 0;
            scoEnv.useCases[suite.id].skippedScenarios = 0;
        }
    }

    /**
     * is invoked when a spec is starting (i.e. for every scenario)
     * @param spec
     */
    function specStarted(spec) {
        scoEnv.currentScenario = spec;
        spec._suite = scoEnv.currentUseCase;
    }

    /**
     * is invoked when all tests are done (at the end of all use cases)
     */
    function jasmineDone() {
        console.log('All done!');
        scoEnv.build.status = (scoEnv.build.failedUseCases === 0) ? 'success' : 'failed';

        ScenarioDocuWriter.saveBuild({
            status: scoEnv.build.status,
            name: scoEnv.build.name,
            date: scoEnv.build.date,
            revision: scoEnv.build.revision
        });
    }

    /**
     * is invoked at the end of a spec  (i.e. after every scenario)
     */
    function specDone(spec) {

        if (spec.status === 'pending') {
            console.log('scenario :: ' + spec.description + ' :: skipped!');
            scoEnv.useCases[spec._suite.id].skippedScenarios++;
            return;
        }

        var didFail = spec.status === 'failed';

        if (didFail) {
            scoEnv.useCases[spec._suite.id].failedScenarios++;
        } else {
            scoEnv.useCases[spec._suite.id].passedScenarios++;
        }

        console.log('scenario :: ' + spec.description + ' :: ' + (didFail ? 'failed' : 'passed'));
        var currentScenario = {
            name: spec.description,
            description: scoEnv.scenarios[spec._suite.id].additionalDescription,
            stepCounter: 0,
            status: didFail ? 'failed' : 'success'
        };

        ScenarioDocuWriter.saveScenario(currentScenario, spec._suite.description);
    }

    /**
     * is invoked when a suite is done (i.e. after every use case)
     * @param suite
     */
    function suiteDone(suite) {
        if (!suite.isUseCase) {
            return;
        }

        scoEnv.currentUseCase = undefined;

        var useCaseState = scoEnv.useCases[suite.id];
        var didFail = useCaseState.failedScenarios > 0;

        if (didFail) {
            scoEnv.build.failedUseCases++;
        } else {
            scoEnv.build.passedUseCases++;
        }

        console.log(util.format('useCase :: %s :: %s (%d passed, %d failed, %d skipped)',
            suite.description,
            didFail ? 'failed' : 'passed',
            useCaseState.passedScenarios,
            useCaseState.failedScenarios,
            useCaseState.skippedScenarios));

        var useCase = {
            name: suite.description,
            description: useCaseState.additionalDescription,
            status: didFail ? 'failed' : 'success'
        };
        ScenarioDocuWriter.saveUseCase(useCase);
    }
}

module.exports = ScenariooJasmineReporter;
