var
  path = require('path'),
  Q = require('q'),
  assert = require('assert'),
  testHelper = require('../../utils/testHelper'),
  mockWebdriver = require('../../utils/mockWebdriver'),
  store = require('../../../lib/scenariooStore'),
  docuWriter = require('../../../lib/docuWriter/docuWriter');

before(function () {
  mockWebdriver.registerMockGlobals();
});

describe('docuWriter', function () {

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

    it('should write branch directory on start()', function () {
      docuWriter.start(dummyBranch, 'some build name', targetDir)
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will');
          return testHelper.assertFileExists(expectedFilePath);
        });
    });

    it('should write branch.xml on start() with all attributes', function () {
      return docuWriter.start(dummyBranch, 'some build name', targetDir)
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/branch.xml');
          return testHelper.assertXmlContent(expectedFilePath, [
            '<branch><name>my unsafe branch name, will</name>',
            '<description>my safe description</description>'
          ]);
        });
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

    it('should save mandatory fields correctly build.xml', function () {
      var buildDate = new Date();
      var build = {
        name: 'save_build_test',
        date: buildDate,
        status: 'failed'
      };

      return docuWriter.saveBuild(build, targetDir)
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/save_build_test/build.xml');
          return testHelper.assertXmlContent(expectedFilePath, [
            '<build><name>save_build_test</name>',
            '<date>' + buildDate.toISOString() + '</date>',
            '<status>failed</status>'
          ]);
        });
    });

  });


  describe('#saveUseCase()', function () {

    beforeEach(function () {
      docuWriter.start(dummyBranch, 'some build name', targetDir);
    });

    it('should create useCase directory', function () {
      return docuWriter.saveUseCase(dummyUseCase)
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll%21');
          return testHelper.assertFileExists(expectedFilePath);
        });
    });

    it('should create usecase.xml', function () {
      return docuWriter.saveUseCase(dummyUseCase)
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll%21/usecase.xml');
          return testHelper.assertXmlContent(expectedFilePath, [
            '<name>use case name, toll!</name>',
            '<description>some description with special chars ;) %&amp;</description>',
            '<status>success</status>'
          ]);
        });

    });
  });

  describe('#saveScenario()', function () {

    beforeEach(function () {
      docuWriter.start(dummyBranch, 'some build name', targetDir);
      return docuWriter.saveUseCase(dummyUseCase);
    });

    it('should save scenario directory', function () {
      return docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name');
          return testHelper.assertFileExists(expectedFilePath);
        });
    });

    it('should save scenario.xml', function () {
      return docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name/scenario.xml');
          return testHelper.assertXmlContent(expectedFilePath, [
            '<name> some cool scenario name</name>',
            '<description>scenario description</description>',
            '<status>success</status>'
          ]);
        });
    });

  });

  describe('#saveStep()', function () {

    beforeEach(function () {
      docuWriter.start(dummyBranch, 'myBuildName', targetDir);
      store.init(dummyBranch.name, dummyBranch.description, 'myBuildName');
      store.updateCurrentUseCase({name: 'UseCaseDescription'});
      store.updateCurrentScenario({name: 'ScenarioDescription'});
    });

    it('should save a step', function () {
      return docuWriter.saveStep('my step')
        .then(function () {
          var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/myBuildName/UseCaseDescription/ScenarioDescription/steps/000.xml');
          return testHelper.assertFileExists(expectedFilePath);
        });
    });

    it('should save a step with default pagename', function () {

      docuWriter.registerPageNameFunction(undefined);

      return docuWriter.saveStep('my step')
        .then(function (result) {
          assert.equal(result.step.page.name, '#_somepage');
          assert.equal(result.step.stepDescription.index, 0);
        });
    });

    it('should increase stepCounter', function () {
      var firstSave = docuWriter.saveStep('my step 1')
        .then(function (result) {
          assert.equal(result.step.stepDescription.index, 0);
        });
      var secondSave = docuWriter.saveStep('my step 2')
        .then(function (result) {
          assert.equal(result.step.stepDescription.index, 1);
        });

      return Q.all([firstSave, secondSave]);
    });

    it('should save a step with custom pagename function', function () {
      docuWriter.registerPageNameFunction(function (url) {
        var pos = url.href.indexOf('#');
        if (pos > -1) {
          return url.href.substring(pos + 1);
        } else {
          return url.href;
        }
      });

      return docuWriter.saveStep('my step')
        .then(function (result) {
          assert.equal(result.step.page.name, '_somepage');
        });
    });

    it('should save a step with additional information (labels)', function () {
      return docuWriter.saveStep('my step', {
        labels: ['red']
      })
        .then(function (result) {
          var stepDescriptionLabels = result.step.stepDescription.labels;
          assert.deepEqual(stepDescriptionLabels, ['red']);

          return testHelper.assertXmlContent(result.xmlPath, [
            '<labels><label>red</label></labels></stepDescription>'
          ]);
        });
    });

    /**
     * At the moment, this does not work as expected.
     * //TODO: Discuss this with the scenarioo core team.
     */
    it('should save a step with additional misc data ("details") including arrays', function () {
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

      return docuWriter.saveStep('my step', {
        details: dummyDetailData
      })
        .then(function (result) {
          assert(result.step.stepDescription.details);
        });
    });

  });

});
