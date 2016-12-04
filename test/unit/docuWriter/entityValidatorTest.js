import assert from 'assert';
import validator from '../../../src/docuWriter/entityValidator';

describe('entityValidator', () => {

  describe('#validateBranch()', () => {

    it('should not throw on valid minimal branch', () => {
      validator.validateBranch({
        name: 'Some branch name'
      });
    });

    it('should not throw on valid full branch', () => {
      validator.validateBranch({
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
        name: 'Some Build name',
        date: new Date().toISOString()
      });
    });

    it('should not throw on valid full build', () => {
      validator.validateBuild({
        name: 'Some build name',
        revision: '123',
        date: new Date().toISOString(),
        status: 'success'
      });
    });

    it('should throw on invalid build: missing required properties', () => {
      assert.throws(() => validator.validateBuild({}), /Missing required property: name .* Missing required property: date/);
    });

    it('should throw on invalid build: status attribute not "failed" or "success"', () => {
      assert.throws(() => validator.validateBuild({
        name: 'Some Build name',
        status: 'someThingElse',
        date: new Date().toISOString()
      }), /build: No enum match for: "someThingElse"/);
    });

  });

  describe('#validateUseCase()', () => {

    it('should not throw on valid minimal useCase', () => {
      validator.validateUseCase({
        name: 'Some use case name'
      });
    });

    it('should not throw on valid full useCase', () => {
      validator.validateUseCase({
        name: 'Some use case name',
        description: 'some use case description',
        status: 'success',
        labels: ['one', 'two']
      });
    });

    it('should throw on invalid useCase: missing required properties', () => {
      assert.throws(() => validator.validateUseCase({}), /Missing required property: name .* /);
    });

    it('custom status text is allowed', () => {
      validator.validateUseCase({
        name: 'Some use case name',
        status: 'my-custom-status'
      });
    });

  });

  describe('#validateScenario()', () => {

    it('should not throw on valid minimal scenario', () => {
      validator.validateScenario({
        name: 'Some scenario name',
        status: 'success'
      });
    });

    it('should not throw on valid full scenario', () => {
      validator.validateScenario({
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
        name: 'Some scenario name',
        status: 'my-custom-status'
      });
    });

  });

  describe('#validateStep()', () => {

    it('should not throw on valid minimal step', () => {
      validator.validateStep({});
    });

    it('should not throw on valid step with screenAnnotations', () => {
      validator.validateStep({
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
        page: {
          name: 'some page name',
          labels: ['one', 'two']
        },
        stepDescription: {
          index: 0,
          title: 'stepTitle',
          status: 'failed',
          screenshotFileName: 'someFileName.png',
          labels: ['one', 'two']
        },
        html: {
          htmlSource: '<html><body>bla</body></html>'
        },
        screenAnnotations: [
          {
            region: {x: 1, y: 2, width: 100, height: 100}
          }
        ],
        metadata: {
          visibleText: 'bla'
        }
      });
    });

    it('should throw on invalid step: invalid page', () => {

      assert.throws(() => validator.validateStep({
        page: {
          // name is missing
          labels: 'other'    // must be an array
        }
      }), /Missing required property: name .* Invalid type: string \(expected array\) \(\/page\/labels, \/properties\/page\/properties\/labels\/type\)/);

    });

  });

});
