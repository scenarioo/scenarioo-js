import path from 'path';
import assert from 'assert';
import Q from 'q';
import testHelper from '../../utils/testHelper';
import mockWebdriver from '../../utils/mockGlobals';
import docuWriter from '../../../src/docuWriter/docuWriter';
import store from '../../../src/scenariooStore';

before(() => {
  mockWebdriver.registerMockGlobals();
});

describe('docuWriter', () => {

  /** let's set up some dummy objects **/
  const targetDir = './test/out/docu';

  const dummyBranch = {
    name: 'my unsafe branch name, will',
    description: 'my safe description'
  };

  const dummyUseCase = {
    name: 'use case name, toll!',
    description: 'some description with special chars ;) %&',
    status: 'success'
  };

  const dummyScenario = {
    name: ' some cool scenario name',
    description: 'scenario description',
    status: 'success'
  };

  describe('#start()', () => {

    it('should write branch directory on start()', () => {
      docuWriter.start(dummyBranch, 'some build name', targetDir, {})
        .then(() => testHelper.assertFileExists(path.join(targetDir, 'my+unsafe+branch+name%2C+will')));
    });

    it('should write branch.xml on start() with all attributes', () => {
      return docuWriter.start(dummyBranch, 'some build name', targetDir, {})
        .then(() => testHelper.assertXmlContent(path.join(targetDir, 'my+unsafe+branch+name%2C+will/branch.xml'), [
          '<branch><name>my unsafe branch name, will</name>',
          '<description>my safe description</description>'
        ]));
    });
  });

  describe('#saveBuild()', () => {

    beforeEach(()  => {
      return docuWriter.start(dummyBranch, 'save_build_test', targetDir, {});
    });

    it('should save mandatory fields correctly build.xml', () => {
      const buildDate = new Date();
      const build = {
        name: 'save_build_test',
        date: buildDate,
        status: 'failed'
      };

      return docuWriter.saveBuild(build, targetDir)
        .then(() => testHelper.assertXmlContent(path.join(targetDir, 'my+unsafe+branch+name%2C+will/save_build_test/build.xml'), [
          '<build><name>save_build_test</name>',
          '<date>' + buildDate.toISOString() + '</date>',
          '<status>failed</status>'
        ]));
    });

  });


  describe('#saveUseCase()', () => {

    beforeEach(() => {
      docuWriter.start(dummyBranch, 'some build name', targetDir, {});
    });

    it('should create useCase directory', () => {
      return docuWriter.saveUseCase(dummyUseCase)
        .then(() => testHelper.assertFileExists(path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll%21')));
    });

    it('should create usecase.xml', () => {
      return docuWriter.saveUseCase(dummyUseCase)
        .then(() => testHelper.assertXmlContent(path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll%21/usecase.xml'), [
          '<name>use case name, toll!</name>',
          '<description>some description with special chars ;) %&amp;</description>',
          '<status>success</status>'
        ]));
    });
  });

  describe('#saveScenario()', () => {

    beforeEach(() => {
      docuWriter.start(dummyBranch, 'some build name', targetDir, {});
      return docuWriter.saveUseCase(dummyUseCase);
    });

    it('should save scenario directory', () => {
      return docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(() => testHelper.assertFileExists(path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name')));
    });

    it('should save scenario.xml', () => {
      return docuWriter.saveScenario(dummyScenario, 'a use case')
        .then(() => testHelper.assertXmlContent(path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name/scenario.xml'), [
          '<name> some cool scenario name</name>',
          '<description>scenario description</description>',
          '<status>success</status>'
        ]));
    });

  });

  describe('#saveStep()', () => {

    beforeEach(() => {
      docuWriter.start(dummyBranch, 'myBuildName', targetDir, {});
      store.init(dummyBranch.name, dummyBranch.description, 'myBuildName');
      store.updateCurrentUseCase({name: 'UseCaseDescription'});
      store.updateCurrentScenario({name: 'ScenarioDescription'});
    });

    it('should save a step', () => {
      return docuWriter.saveStep('my step')
        .then(() => testHelper.assertFileExists(path.join(targetDir, 'my+unsafe+branch+name%2C+will/myBuildName/UseCaseDescription/ScenarioDescription/steps/000.xml')));
    });

    it('should save a step with default pagename', () => {

      docuWriter.registerPageNameFunction(undefined);

      return docuWriter.saveStep('my step')
        .then(result => {
          assert.equal(result.step.page.name, '#_somepage');
          assert.equal(result.step.stepDescription.index, 0);
        });
    });

    it('should increase stepCounter', () => {
      var firstSave = docuWriter.saveStep('my step 1')
        .then(result => {
          assert.equal(result.step.stepDescription.index, 0);
        });
      var secondSave = docuWriter.saveStep('my step 2')
        .then(result => {
          assert.equal(result.step.stepDescription.index, 1);
        });

      return Q.all([firstSave, secondSave]);
    });

    it('should save a step with custom pagename function', () => {
      docuWriter.registerPageNameFunction(url => {
        var pos = url.href.indexOf('#');
        if (pos > -1) {
          return url.href.substring(pos + 1);
        } else {
          return url.href;
        }
      });

      return docuWriter.saveStep('my step')
        .then(result => {
          assert.equal(result.step.page.name, '_somepage');
        });
    });

    it('should save a step with additional information (labels)', () => {
      return docuWriter.saveStep('my step', {
        labels: ['red']
      })
        .then(result => {
          var stepDescriptionLabels = result.step.stepDescription.labels;
          assert.deepEqual(stepDescriptionLabels, ['red']);

          return testHelper.assertXmlContent(result.xmlPath, [
            '<labels><label>red</label></labels></stepDescription>'
          ]);
        });
    });

    it('should save a step without name but additional attributes', () => {
      return docuWriter.saveStep({
        labels: ['red']
      })
        .then(result => {
          return testHelper.assertXmlContent(result.xmlPath, [
            '<labels><label>red</label></labels>'
          ]);
        });
    });

    it('should save a step with additional information (screen annotations)', () => {
      return docuWriter.saveStep('my step', {
        screenAnnotations: [{
          x: 758,
          y: 462,
          width: 55,
          height: 28,
          style: 'CLICK',
          screenText: 'a text',
          title: 'Clicked Button',
          description: 'User clicked on button'
        }]
      })
        .then(result => {
          var screenAnnotations = result.step.screenAnnotations;
          assert.deepEqual(screenAnnotations, [
            {
              region: {x: 758, y: 462, width: 55, height: 28},
              style: 'CLICK',
              screenText: 'a text',
              title: 'Clicked Button',
              description: 'User clicked on button'
            }
          ]);

          return testHelper.assertXmlContent(result.xmlPath, [
            '<screenAnnotations><screenAnnotation>',
            '<style>CLICK</style>',
            '<region><x>758</x><y>462</y><width>55</width><height>28</height></region>',
            '<screenText>a text</screenText><title>Clicked Button</title><description>User clicked on button</description>'
          ]);
        });
    });

  });

});
