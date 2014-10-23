'use strict';

var
  docuWriter = require('../../lib/scenarioDocuWriter.js'),
  extend = require('extend'),
  expect = require('expect.js'),
  Q = require('q'),
  fs = require('fs');

before(function () {

  // define our mock jasmine object
  global.jasmine = {
    getEnv: function () {
      var env = {
        currentSpec: {
          suite: {
            description: 'SuiteDescription'
          },
          description: 'specDescription'
        }
      };
      return env;
    }
  };

  global.browser = {
    getCurrentUrl: function () {
      var deferred = Q.defer();
      deferred.resolve('http://example.url.com');
      return deferred.promise;
    },
    takeScreenshot: function () {
      var deferred = Q.defer();
      deferred.resolve('dummyImageDate');
      return deferred.promise;
    }
  };

  global.by = {
    css: function () {
    }
  };

  global.element = function () {
    return {
      getOuterHtml: function () {
        var outerHtmlDeferred = Q.defer();
        outerHtmlDeferred.resolve('<html></html>');
        return outerHtmlDeferred.promise;
      }
    };
  };

});

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

  function assertFileExists(filePath, done) {
    fs.exists(filePath, function (result) {
      expect(result).to.be(true);
      done();
    });
  }

  it('should write branch on start()', function (done) {
    var timeStamp = getTS();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir)
      .then(function () {
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/branch.xml';
        assertFileExists(expectedFilePath, done);
      });
  });

  it('should save usecase', function (done) {
    var timeStamp = getTS();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    docuWriter.saveUseCase(dummyUseCase)
      .then(function () {
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/use_case_name__toll_/usecase.xml';
        assertFileExists(expectedFilePath, done);
      });
  });

  it('should save scenario', function (done) {
    var timeStamp = getTS();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    docuWriter.saveUseCase(dummyUseCase)
      .then(function () {
        docuWriter.saveScenario(dummyScenario)
          .then(function () {
            var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/use_case_name__toll_/_some_cool_scenario_name/scenario.xml';
            assertFileExists(expectedFilePath, done);
          });
      });
  });

  it('should save a step', function (done) {
    var timeStamp = getTS();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    docuWriter.saveStep('my step').then(function () {
      var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/suitedescription/specdescription/steps/000.xml';
      assertFileExists(expectedFilePath, done);
    }, function (err) {
      throw new Error(err);
    });
  });

});
