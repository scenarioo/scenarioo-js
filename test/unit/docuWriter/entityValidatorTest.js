import assert from 'assert';
import validator from '../../../src/docuWriter/entityValidator';

describe('entityValidator', () => {

  describe('#validateBranch()', () => {

    it('should not throw on valid minimal branch', () => {
      validator.validateBranch({
        name: 'Some branch name',
        id: 'Some-branch-name'
      });
    });

    it('should not throw on valid full branch', () => {
      validator.validateBranch({
        id: 'Some-branch-name',
        name: 'Some branch name',
        description: 'branch description'
      });
    });

    it('should throw on invalid branch: missing required properties', () => {
      assert.throws(() => validator.validateBranch({}), /Missing required property: name/);
    });

  });


  describe('#validateBuild()', () => {

    it('should not throw on valid minimal build', () => {
      validator.validateBuild({
        id: 'Some-Build-name',
        name: 'Some Build name',
        date: new Date().toISOString()
      });
    });

    it('should not throw on valid full build', () => {
      validator.validateBuild({
        id: 'Some-Build-name',
        name: 'Some build name',
        revision: '123',
        date: new Date().toISOString(),
        status: 'success'
      });
    });

    it('should throw for invalid date string', () => {
      validator.validateBuild({
        id: 'Some-Build-name',
        name: 'Some build name',
        date: 'blabla'
      });
    });

    it('should throw on invalid build: missing required properties', () => {
      assert.throws(() => validator.validateBuild({}), /Missing required property: id .* Missing required property: name/);
    });

  });

  describe('#validateUseCase()', () => {

    it('should not throw on valid minimal useCase', () => {
      validator.validateUseCase({
        id: 'Some-use-case-name',
        name: 'Some use case name'
      });
    });

    it('should not throw on valid full useCase', () => {
      validator.validateUseCase({
        id: 'Some-use-case-name',
        name: 'Some use case name',
        description: 'some use case description',
        status: 'success',
        labels: ['one', 'two']
      });
    });

    it('should throw on invalid useCase: missing required properties', () => {
      assert.throws(() => validator.validateUseCase({}), /Missing required property: id .* Missing required property: name/);
    });

    it('custom status text is allowed', () => {
      validator.validateUseCase({
        id: 'Some-use-case-name',
        name: 'Some use case name',
        status: 'my-custom-status'
      });
    });

  });

  describe('#validateScenario()', () => {

    it('should not throw on valid minimal scenario', () => {
      validator.validateScenario({
        id: 'Some-scenario-name',
        name: 'Some scenario name',
        status: 'success'
      });
    });

    it('should not throw on valid full scenario', () => {
      validator.validateScenario({
        id: 'Some-scenario-name',
        name: 'Some scemario name',
        description: 'some scenario description',
        status: 'success',
        labels: ['one', 'two']
      });
    });

    it('should throw on invalid scenario: missing required properties', () => {
      assert.throws(() => validator.validateScenario({}), /Missing required property: name .* Missing required property: status/);
    });

    it('custom status text is allowed on use case', () => {
      validator.validateScenario({
        id: 'Some-scenario-name',
        name: 'Some scenario name',
        status: 'my-custom-status'
      });
    });

  });

  describe('#validateStep()', () => {

    it('should not throw on valid minimal step', () => {
      validator.validateStep({
        index: 0
      });
    });

    it('should not throw on valid step with screenAnnotations', () => {
      validator.validateStep({
        index: 0,
        screenAnnotations: [{
          region: {x: 758, y: 462, width: 55, height: 28},
          style: 'CLICK',
          screenText: 'a text',
          title: 'Clicked Button',
          description: 'User clicked on button',
          clickAction: 'TO_NEXT_STEP',
          clickActionUrl: 'http://somewhere',
          clickActionText: 'User clicked on button'
        }]
      });
    });

    it('should not throw on valid full scenario', () => {
      validator.validateStep({
        index: 0,
        title: 'stepTitle',
        status: 'failed',
        labels: ['one', 'two'],
        page: {
          name: 'some page name',
          labels: ['one', 'two']
        },
        visibleText: 'bla',
        screenAnnotations: [
          {
            region: {x: 1, y: 2, width: 100, height: 100}
          }
        ],
        properties: {
          labelKey: 'some property',
          value: 'bla'
        }
      });
    });

    it('should throw on invalid step: invalid page', () => {

      assert.throws(() => validator.validateStep({
        index: 0,
        page: {
          // name is missing
          labels: []
        }
      }), /Missing required property: name .* Invalid type: string \(expected array\) \(\/page\/labels, \/properties\/page\/properties\/labels\/type\)/);

    });

    it('should throw on invalid step: labels is not an array', () => {

      assert.throws(() => validator.validateStep({
        index: 0,
        labels: 'other'    // must be an array
      }), /Invalid type: string \(expected array\) \(\/labels, \/properties\/labels\/type\)/);

    });

  });

});
