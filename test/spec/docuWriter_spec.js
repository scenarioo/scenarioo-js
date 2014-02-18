'use strict';

var docuWriter = require('../../lib/scenarioDocuWriter.js');
var extend = require('extend');

describe('scenarioDocuWriter', function () {

    /** let's set up some dummy objects **/
    var targetDir = './test/out/docu';

    var dummyBranch = {
        name: 'my unsafe branch name, will',
        description: 'my safe description'
    };

    var dummyBuild = {
        name: 'some build name_',
        revision: '1234'
    };

    var dummyUseCase = {
        name: 'use case name, toll!',
        description: 'some description with special chars ;) %&'
    };

    var dummyScenario = {
        useCaseName: dummyUseCase.name,
        scenarioName: ' some cool scenario name',
        scenarioDescription: 'scenario description',
        stepCounter: 0
    };

    function getTimeStampedBuildObject() {
        var build = {};
        extend(build, dummyBuild);
        var timeStamp = Math.round((new Date()).getTime() / 1000);
        build.name = build.name + timeStamp;
        return build;
    }

    it('should write branch and build on start()', function () {
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(), targetDir);
    });

    it('should write usecase xml', function () {
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(), targetDir);
        docuWriter.saveUseCase(dummyUseCase);
    });

    it('should write scenario xml', function () {
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(), targetDir);
        docuWriter.saveUseCase(dummyUseCase);
        docuWriter.saveScenario(dummyScenario);
    });


});