'use strict';

var
  path = require('path'),
  testHelper = require('../utils/testHelper'),
  mockWebdriver = require('../utils/mockWebdriver'),
  docuWriter = require('../../lib/scenarioDocuWriter.js'),
  expect = require('expect.js');

before(function () {
  mockWebdriver.registerMockGlobals();
});

describe('scenarioDocuWriter', function () {

  /** let's set up some dummy objects **/
  var targetDir = './test/out/docu';

  describe('#start()', function () {

    it('should write branch/build directory on start()', function (done) {
      docuWriter.start(targetDir, 'someBranch', 'someBuild')
        .then(function (actualFilePath) {
          var expectedPath = path.join(path.resolve(targetDir), '/someBranch/someBuild');
          expect(actualFilePath).to.be(expectedPath);
          testHelper.assertFileExists(targetDir, expectedPath, done);
        })
        .catch(done);
    });

    it('branch and build names are sanitized and encoded', function (done) {
      docuWriter.start(targetDir, 'some\\branch', 'some build')
        .then(function (actualFilePath) {
          var expectedPath = path.join(path.resolve(targetDir), '/some_branch/some+build');
          expect(actualFilePath).to.be(expectedPath);
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

    it('should throw if branch name is missing', function (done) {
      // do not check for full validation here -> entityValidatorTest
      var branch = {/* no name */};
      expect(function () {
        docuWriter.saveBranch(branch);
      }).to.throwException(function (e) {
          expect(e.message).to.contain('Missing required property: name');
          done();
        });
    });

    it('should throw if branch name does not match', function (done) {
      var branch = {name: 'notSomeBranch'};
      expect(function () {
        docuWriter.saveBranch(branch);
      }).to.throwException(function (e) {
          expect(e.message).to.be('ScenarioDocuWriter was started with branch name some_Branch, but given branch object has name notSomeBranch');
          done();
        });
    });

    it('should write branch.xml with attributes', function (done) {
      var branch = {
        name: 'some\\Branch',
        description: 'my super branch'
      };

      docuWriter.saveBranch(branch)
        .then(function (actualFilePath) {
          expect(actualFilePath).to.contain('branch.xml');

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

      expect(function () {
        docuWriter.saveBuild(build);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Missing required property: name');
        });
    });

    it('should throw if build name does not match', function () {
      var buildDate = new Date();
      var build = {
        name: 'notSomeBuild',
        date: buildDate,
        status: 'failed'
      };

      expect(function () {
        docuWriter.saveBuild(build);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('ScenarioDocuWriter was started with build name someBuild, but given branch object has name notSomeBuild');
        });
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
          expect(actualFilePath).to.contain('someBuild');
          expect(actualFilePath).to.contain('someBranch');
          expect(actualFilePath).to.contain('build.xml');

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

      expect(function () {
        docuWriter.saveUseCase(useCase);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Missing required property: name ()');
        });
    });

    it('should write usecase.xml with attributes', function (done) {

      var useCase = {
        name: 'use case name, toll!',
        description: 'some description with special chars ;) %&',
        status: 'success'
      };
      docuWriter.saveUseCase(useCase)
        .then(function (actualFilePath) {
          expect(actualFilePath).to.contain('someBranch');
          expect(actualFilePath).to.contain('someBuild');
          expect(actualFilePath).to.contain('use+case+name%2C+toll!');
          expect(actualFilePath).to.contain('usecase.xml');
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


  // bis hier

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

      expect(function () {
        docuWriter.saveScenario('someUseCase', scenario);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Missing required property: name');
        });
    });

    it('should write scenario.xml with attributes', function (done) {
      var scenario = {
        name: ' some cool scenario name',
        description: 'scenario description',
        status: 'success'
      };

      docuWriter.saveScenario('someUseCase', scenario)
        .then(function (actualFilePath) {
          expect(actualFilePath).to.contain('someBranch');
          expect(actualFilePath).to.contain('someBuild');
          expect(actualFilePath).to.contain('someUseCase');
          expect(actualFilePath).to.contain('+some+cool+scenario+name');
          expect(actualFilePath).to.contain('scenario.xml');
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
    // TODO:!

  });


});
