'use strict';

var
  docuWriter = require('../../lib/scenarioDocuWriter.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
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

  function getTimeStamp() {
    return  Math.round((new Date()).getTime() / 1000);
  }

  function getTimeStampedBuildObject(timeStamp) {
    var build = _.cloneDeep(dummyBuild);
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
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir)
      .then(function () {
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/branch.xml';
        assertFileExists(expectedFilePath, done);
      });
  });

  it('should save usecase', function (done) {
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    docuWriter.saveUseCase(dummyUseCase)
      .then(function () {
        var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/use_case_name__toll_/usecase.xml';
        assertFileExists(expectedFilePath, done);
      });
  });

  it('should save scenario', function (done) {
    var timeStamp = getTimeStamp();
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
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    docuWriter.saveStep('my step').then(function () {
      var expectedFilePath = targetDir + '/my_unsafe_branch_name__will/some_build_name_' + timeStamp + '/suitedescription/specdescription/steps/000.xml';
      assertFileExists(expectedFilePath, done);
    }, done);
  });

  it('should save a step with additional misc data ("details")', function (done) {
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    var dummyDetailData = {
      first: {
        arbitrary: 1,
        additional: 'data',
        that: 'should be stored'
      },
      second: {
        arbitrary: 2,
        additional: 'data2',
        that: 'should be stored2'
      }
    };

    docuWriter.saveStep('my step', dummyDetailData).then(function (savedStepData) {
      var stepDescriptionDetails = savedStepData[0].metadata.details;
      expect(stepDescriptionDetails).not.to.be(undefined);
      expect(stepDescriptionDetails.entry[0].key).to.be('first');
      expect(stepDescriptionDetails.entry[0].value).to.eql({
        arbitrary: 1,
        additional: 'data',
        that: 'should be stored'
      });
      expect(stepDescriptionDetails.entry[1].key).to.be('second');
      expect(stepDescriptionDetails.entry[1].value).to.eql({
        arbitrary: 2,
        additional: 'data2',
        that: 'should be stored2'
      });

      done();
    }, done);
  });

  it('should save a step with additional misc data ("details") including arrays', function (done) {
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    var dummyDetailData = {
      complexCustomInfo: [
        'this is a more complex example of metadata',
        'We expect this to end up in valid "entry/key/value" xml'
      ],
      moreComplexCustomInfo: [
        {
          attributeOne: 'valueOne',
          attributeTwo: 'valueTwo'
        },
        {
          attributeOne: 'valueOneOne',
          attributeTwo: 'valueTwoTwo'
        }
      ]
    };

    docuWriter.saveStep('my step', dummyDetailData).then(function (savedStepData) {
      var stepDescriptionDetails = savedStepData[0].metadata.details;

      expect(stepDescriptionDetails).not.to.be(undefined);


      done();
    }, done);
  });

  it('should fail if step metadata details is not an object', function (done) {
    var timeStamp = getTimeStamp();
    docuWriter.start(dummyBranch, getTimeStampedBuildObject(timeStamp), targetDir);
    var dummyDetailData = [];

    docuWriter.saveStep('my step', dummyDetailData)
      .then(function () {
        done('should not be successful!');
      }, function (err) {
        expect(err.message).to.contain('Step metadata details must be an object');
        done();
      });
  });

});
