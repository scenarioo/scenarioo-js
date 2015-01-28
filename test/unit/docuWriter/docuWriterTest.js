'use strict';

var
  Q = require('q'),
  assert = require('assert'),
  path = require('path'),
  testHelper = require('../../testUtils/testHelper'),
  mockWebdriver = require('../../testUtils/mockWebdriver'),
  docuWriter = require('../../../lib/scenarioo').docuWriter;

before(function () {
  mockWebdriver.registerMockGlobals();
});

describe('scenarioDocuWriter', function () {

  /** let's set up some dummy objects **/
  var targetDir = './test/out/docu';

  describe('#start()', function () {

    it('should write branch/build directory on start()', function (done) {
      docuWriter.start(targetDir, 'someBranch', 'someBuild', 'a3bc333f')
        .then(function (actualFilePath) {
          var expectedPath = path.join(path.resolve(targetDir), '/someBranch/someBuild');
          assert.equal(actualFilePath, expectedPath);
          testHelper.assertFileExists(targetDir, expectedPath, done);
        })
        .catch(done);
    });

    it('branch and build names are sanitized and encoded', function (done) {
      docuWriter.start(targetDir, 'some\\branch', 'some build')
        .then(function (actualFilePath) {
          var expectedPath = path.join(path.resolve(targetDir), '/some_branch/some+build');
          assert.equal(actualFilePath, expectedPath);
          testHelper.assertFileExists(targetDir, expectedPath, done);
        })
        .catch(done);
    });


  });

  describe('#saveBranch()', function () {

    beforeEach(function (done) {
      docuWriter.start(targetDir, 'some\\Branch', 'someBuild')
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should throw if branch name is missing', function () {
      // do not check for full validation here -> entityValidatorTest
      var branch = {/* no name */};

      assert.throws(function () {
        docuWriter.saveBranch(branch);
      }, /Missing required property: name/);
    });

    it('should throw if branch name does not match', function () {
      var branch = {name: 'notSomeBranch'};
      assert.throws(function () {
        docuWriter.saveBranch(branch);
      }, /ScenarioDocuWriter was started with branch name some_Branch, but given branch object has name notSomeBranch/);
    });

    it('should write branch.xml with attributes', function (done) {
      var branch = {
        name: 'some\\Branch',
        description: 'my super branch'
      };

      docuWriter.saveBranch(branch)
        .then(function (actualFilePath) {
          assert.contain(actualFilePath, 'branch.xml');
          testHelper.assertXmlContent(actualFilePath, {
            branch: {
              name: ['some_Branch'],
              description: ['my super branch']
            }
          }, done);
        })
        .catch(done);
    });
  });


  describe('#saveBuild()', function () {

    beforeEach(function (done) {
      docuWriter.start(targetDir, 'someBranch', 'someBuild')
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should throw if name attribute is missing ', function () {
      // do not check for full validation here -> entityValidatorTest
      var build = {};

      assert.throws(function () {
        docuWriter.saveBuild(build);
      }, /Missing required property: name/);
    });

    it('should throw if build name does not match', function () {
      var buildDate = new Date();
      var build = {
        name: 'notSomeBuild',
        date: buildDate,
        status: 'failed'
      };

      assert.throws(function () {
        docuWriter.saveBuild(build);
      }, /ScenarioDocuWriter was started with build name someBuild, but given build object has name notSomeBuild/);
    });

    it('should write build.xml with attributes', function (done) {
      var buildDate = new Date();
      var build = {
        name: 'someBuild',
        date: buildDate,
        status: 'failed'
      };

      docuWriter.saveBuild(build)
        .then(function (actualFilePath) {
          assert.contain(actualFilePath, 'someBuild');
          assert.contain(actualFilePath, 'someBranch');
          assert.contain(actualFilePath, 'build.xml');

          testHelper.assertXmlContent(actualFilePath, {
            build: {
              name: ['someBuild'],
              date: [buildDate.toISOString()],
              status: ['failed']
            }
          }, done);
        })
        .catch(done);
    });

  });

  describe('#saveUseCase()', function () {

    beforeEach(function (done) {
      docuWriter.start(targetDir, 'someBranch', 'someBuild')
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should throw if name attribute is missing ', function () {
      // do not check for full validation here -> entityValidatorTest
      var useCase = {
        status: 'success'
      };

      assert.throws(function () {
        docuWriter.saveUseCase(useCase);
      }, /Missing required property: name ()/);
    });

    it('should write usecase.xml with attributes', function (done) {

      var useCase = {
        name: 'use case name, toll!',
        description: 'some description with special chars ;) %&',
        status: 'success'
      };
      docuWriter.saveUseCase(useCase)
        .then(function (actualFilePath) {
          assert.contain(actualFilePath, 'someBranch');
          assert.contain(actualFilePath, 'someBuild');
          assert.contain(actualFilePath, 'use+case+name%2C+toll!');
          assert.contain(actualFilePath, 'usecase.xml');

          testHelper.assertXmlContent(actualFilePath, {
            useCase: {
              name: ['use case name, toll!'],
              description: ['some description with special chars ;) %&'],
              status: ['success']
            }
          }, done);
        })
        .catch(done);
    });

  });

  describe('#saveScenario()', function () {

    beforeEach(function (done) {
      docuWriter.start(targetDir, 'someBranch', 'someBuild')
        .then(function () {
          done();
        });
    });

    it('should throw if name attribute is missing ', function () {
      // do not check for full validation here -> entityValidatorTest
      var scenario = {
        status: 'successs'
      };

      assert.throws(function () {
        docuWriter.saveScenario('someUseCase', scenario);
      }, /Missing required property: name/);
    });

    it('should write scenario.xml with attributes', function (done) {
      var scenario = {
        name: ' some cool scenario name',
        description: 'scenario description',
        status: 'success'
      };

      docuWriter.saveScenario('someUseCase', scenario)
        .then(function (actualFilePath) {
          assert.contain(actualFilePath, 'someBranch');
          assert.contain(actualFilePath, 'someBuild');
          assert.contain(actualFilePath, 'someUseCase');
          assert.contain(actualFilePath, '+some+cool+scenario+name');
          assert.contain(actualFilePath, 'scenario.xml');
          testHelper.assertXmlContent(actualFilePath, {
            scenario: {
              name: [' some cool scenario name'],
              description: ['scenario description'],
              status: ['success']
            }
          }, done);

        })
        .catch(done);
    });

  });

  describe('#saveStep()', function () {

    var mockAdapter = {
      getCurrentPageInformation: function () {
        return Q.when({
          url: 'home.html'
        });
      },
      getScreenshot: function () {
        return Q.when('ghsjkghjksdhgsjkdghksdjg');
      }
    };

    var mockReporter = {
      onInit: function () {

      },
      getCurrentUseCaseName: function () {
        return 'someUseCase';
      },
      getCurrentScenarioName: function () {
        return ' some cool scenario name';
      },
      getAndIncrementStepCounter: function () {
        return 0;
      }
    };


    beforeEach(function (done) {
      var scenarioo = require('../../../lib/scenarioo');
      scenarioo.useAdapter(mockAdapter);
      scenarioo.useReporter(mockReporter);
      scenarioo.init({
        targetDirectory: targetDir,
        branch: 'someBranch',
        build: 'someBuild',
        revision: '1.2.3'
      });

      docuWriter.start(targetDir, 'someBranch', 'someBuild')
        .then(function () {
          done();
        });
    });

    it('should write step.xml', function (done) {

      docuWriter.saveStep('MySuperStep')
        .then(function (paths) {
          var savedXmlFilePath = paths[0];
          assert.contain(savedXmlFilePath, 'someBranch');
          assert.contain(savedXmlFilePath, 'someBuild');
          assert.contain(savedXmlFilePath, 'someUseCase');
          assert.contain(savedXmlFilePath, '+some+cool+scenario+name');
          assert.contain(savedXmlFilePath, 'steps');
          assert.contain(savedXmlFilePath, '000.xml');

          done();
        })
        .catch(done);
    });


  });


});
