'use strict';

var
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

  var dummyBranch = {
    name: 'my unsafe branch name, will',
    description: 'my safe description'
  };

  var dummyUseCase = {
    name: 'use case name, toll!',
    description: 'some description with special chars ;) %&',
    status: 'success'
  };

  var dummyScenario = {
    name: ' some cool scenario name',
    description: 'scenario description',
    status: 'success'
  };

  describe('#start()', function () {

    it('should throw if name attribute is missing ', function () {
      var branch = {};

      expect(function () {
        docuWriter.start(branch, 'build_name', targetDir);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Branch must contain attribute "name"');
        });
    });

    it('should write branch directory on start()', function (done) {
      docuWriter.start(dummyBranch, 'some build name', targetDir)
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will';
          testHelper.assertFileExists(targetDir, expectedFilePath, done);
        })
        .catch(done);
    });

    it('should write branch.xml on start() with all attributes', function (done) {
      docuWriter.start(dummyBranch, 'some build name', targetDir)
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will/branch.xml';

          testHelper.assertXmlContent(expectedFilePath, {
            branch: {
              name: ['my unsafe branch name, will'],
              description: ['my safe description']
            }
          }, done);
        })
        .catch(done);
    });
  });

  describe('#saveBuild()', function () {

    beforeEach(function (done) {
      docuWriter.start(dummyBranch, 'save_build_test', targetDir)
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should throw if name attribute is missing ', function () {
      var build = {
        date: new Date(),
        status: 'successs'
      };

      expect(function () {
        docuWriter.saveBuild(build, targetDir);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Build must contain attribute "name"');
        });
    });

    it('should throw if date attribute is missing ', function () {
      var build = {
        name: 'some build name',
        status: 'successs'
      };

      expect(function () {
        docuWriter.saveBuild(build, targetDir);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Build must contain attribute "date"');
        });
    });

    it('should throw if status attribute is missing ', function () {
      var build = {
        name: 'some build name',
        date: new Date()
      };

      expect(function () {
        docuWriter.saveBuild(build, targetDir);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Build must contain attribute "status"');
        });
    });

    it('should throw if status attribute is not "failed" or "success" ', function () {
      var build = {
        name: 'some build name',
        date: new Date(),
        status: 'something'
      };

      expect(function () {
        docuWriter.saveBuild(build, targetDir);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Build must contain attribute "status" with value "success" or "failed"');
        });
    });

    it('should save mandatory fields correctly build.xml', function (done) {
      var buildDate = new Date();
      var build = {
        name: 'save_build_test',
        date: buildDate,
        status: 'failed'
      };

      docuWriter.saveBuild(build, targetDir)
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will/save_build_test/build.xml';

          testHelper.assertXmlContent(expectedFilePath, {
            build: {
              name: ['save_build_test'],
              date: [buildDate.toString()],
              status: ['failed']
            }
          }, done);
        })
        .catch(done);
    });

  });


  describe('#saveUseCase()', function () {

    beforeEach(function () {
      docuWriter.start(dummyBranch, 'some build name', targetDir);
    });

    it('should throw if name attribute is missing ', function () {
      var useCase = {
        status: 'successs'
      };

      expect(function () {
        docuWriter.saveUseCase(useCase);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('UseCase must contain attribute "name"');
        });
    });

    it('should throw if status attribute is missing ', function () {
      var useCase = {
        name: 'Some use case'
      };

      expect(function () {
        docuWriter.saveUseCase(useCase);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('UseCase must contain attribute "status"');
        });
    });

    it('should throw if status attribute is not "failed" or "success" ', function () {
      var useCase = {
        name: 'some useCase name',
        status: 'something'
      };

      expect(function () {
        docuWriter.saveUseCase(useCase);
      }).to.throwException(function (err) {
          expect(err.message).to.contain('UseCase must contain attribute "status" with value "success" or "failed"');
        });
    });

    it('should create useCase directory', function (done) {
      docuWriter.saveUseCase(dummyUseCase)
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll!';
          testHelper.assertFileExists(targetDir, expectedFilePath, done);
        })
        .catch(done);
    });

    it('should create usecase.xml', function (done) {
      docuWriter.saveUseCase(dummyUseCase)
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll!/usecase.xml';

          testHelper.assertXmlContent(expectedFilePath, {
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
      docuWriter.start(dummyBranch, 'some build name', targetDir);
      docuWriter.saveUseCase(dummyUseCase)
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should throw if name attribute is missing ', function () {
      var scenario = {
        status: 'successs'
      };

      expect(function () {
        docuWriter.saveScenario(scenario, 'a use case');
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Scenario must contain attribute "name"');
        });
    });

    it('should throw if status attribute is missing ', function () {
      var scenario = {
        name: 'my super scenario'
      };

      expect(function () {
        docuWriter.saveScenario(scenario, 'a use case');
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Scenario must contain attribute "status"');
        });
    });

    it('should throw if status attribute is not "failed" or "success" ', function () {
      var scenario = {
        name: 'some scenario name',
        status: 'something'
      };

      expect(function () {
        docuWriter.saveScenario(scenario, 'a use case');
      }).to.throwException(function (err) {
          expect(err.message).to.contain('Scenario must contain attribute "status" with value "success" or "failed"');
        });
    });

    it('should save scenario directory', function (done) {
      docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(function () {
          var expectedFilePath = targetDir + '//my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name';
          testHelper.assertFileExists(targetDir, expectedFilePath, done);
        })
        .catch(done);
    });

    it('should save scenario.xml', function (done) {
      docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(function () {
          var expectedFilePath = targetDir + '//my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name/scenario.xml';

          testHelper.assertXmlContent(expectedFilePath, {
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

    beforeEach(function () {
      docuWriter.start(dummyBranch, 'myBuildName', targetDir);
    });

    it('should save a step', function (done) {
      docuWriter.saveStep('my step')
        .then(function () {
          var expectedFilePath = targetDir + '/my+unsafe+branch+name%2C+will/myBuildName/SuiteDescription/specDescription/steps/000.xml';
          testHelper.assertFileExists(targetDir, expectedFilePath, done);
        }, done)
        .catch(done);
    });

    it('should save a step with default pagename', function (done) {
      docuWriter.saveStep('my step')
        .then(function (stepData) {
          expect(stepData[0].page.name).to.be('#_somepage');
          done();
        }, done)
        .catch(done);
    });

    it('should save a step with custom pagename function', function (done) {
      docuWriter.registerPageNameFunction(function (url) {
        var pos = url.href.indexOf('#');
        if (pos > -1) {
          return url.href.substring(pos + 1);
        } else {
          return url.href;
        }
      });
      docuWriter.saveStep('my step')
        .then(function (stepData) {
          expect(stepData[0].page.name).to.be('_somepage');
          done();
        }, done)
        .catch(done);
    });

    it('should save a step with additional misc data ("details")', function (done) {
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

      docuWriter.saveStep('my step', dummyDetailData)
        .then(function (savedStepData) {
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
        }, done)
        .catch(done);
    });

    /**
     * At the moment, this does not work as expected.
     * //TODO: Discuss this with the scenarioo core team.
     */
    it('should save a step with additional misc data ("details") including arrays', function (done) {
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

      docuWriter.saveStep('my step', dummyDetailData)
        .then(function (savedStepData) {
          var stepDescriptionDetails = savedStepData[0].metadata.details;
          expect(stepDescriptionDetails).not.to.be(undefined);
          done();
        }, done)
        .catch(done);
    });

    it('should fail if step metadata details is not an object', function (done) {
      var dummyDetailData = [];
      docuWriter.saveStep('my step', dummyDetailData)
        .then(function () {
          done('should not be successful!');
        }, function (err) {
          expect(err.message).to.contain('Step metadata details must be an object');
          done();
        })
        .catch(done);
    });
  });


});
