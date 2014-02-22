'use strict';

var docuWriter = require('../../lib/scenarioDocuWriter.js');
var extend = require('extend');
var fs = require('fs');

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

    function getTS() {
        return  Math.round((new Date()).getTime() / 1000);
    }

    function getTimeStampedBuildObject(timeStamp) {
        var build = {};
        extend(build, dummyBuild);
        build.name = build.name + timeStamp;
        return build;
    }

    function assertFileWillExistWithin(filePath, timeout) {
        waitsFor(function () {
            return fs.existsSync(filePath);
        }, filePath + ' written', timeout);
    }

    it('should write branch on start()', function () {
        var timeStamp = getTS();
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/branch.xml';
        assertFileWillExistWithin(expectedFilePath, 2000);
    });

    it('should save usecase', function () {
        var timeStamp = getTS();
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
        docuWriter.saveUseCase(dummyUseCase);
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/use_case_name__toll_/usecase.xml';
        assertFileWillExistWithin(expectedFilePath, 2000);
    });

    it('should save scenario', function () {
        var timeStamp = getTS();
        docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
        docuWriter.saveUseCase(dummyUseCase);
        docuWriter.saveScenario(dummyScenario);
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/use_case_name__toll_/_some_cool_scenario_name/scenario.xml';
        assertFileWillExistWithin(expectedFilePath, 2000);
    });


});