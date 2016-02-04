import assert from 'assert';
import _ from 'lodash';
import sinon from 'sinon';
import jasmineReporter from '../../../src/reporters/jasmine';
import store from '../../../src/scenariooStore';
import docuWriter from '../../../src/docuWriter/docuWriter';

describe('scenariooJasmineReporter', () => {
  var reporter;

  beforeEach(() => store.clear());
  afterEach(() => store.clear());

  // all of these hook functions get invoked by jasmine. let's assert that our scenarioo state is correctly manipulated
  describe('state manipulation', () => {

    beforeEach(() => {
      reporter = jasmineReporter({
        targetDirectory: './test/out/docu',
        branchName: 'reporterTest-state-manipulation',
        branchDescription: 'reporterTestBranch',
        buildName: 'reporterTestBuild',
        revision: '0.0.1'
      });

      reporter.jasmineStarted();
    });

    it('#jasmineStarted()', () => {
      const state = store.dump();
      assert(state.branch);
      assert(state.build);
      assert(state.build.date);
    });

    it('#suiteStarted()', () => {
      reporter.suiteStarted({
        id: 'suite1',
        description: 'The useCase'
      });
      const state = store.dump();
      assert(state.currentUseCase);
      assert.equal(state.currentUseCase.name, 'The useCase');

    });

    it('#specStarted()', () => {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'UC 1'
      });

      // now invoke specStarted
      const spec = {
        id: 'spec1',
        description: 'SC 1'
      };
      reporter.specStarted(spec);

      const state = store.dump();
      assert(state.currentScenario);
      assert.equal(state.currentScenario.name, 'SC 1');
    });

    it('#specDone() pending', () => {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'pending',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });
      const state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.skippedScenarios, 1);
    });

    it('#specDone() success', () => {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'passed',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      const state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.passedScenarios, 1);
    });

    it('#specDone() failed', () => {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'failed',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      const state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.failedScenarios, 1);
    });

  });


  describe('whole lifecylce', () => {

    before(() => {
      // let's wrap docuWriter's methods with sinon spies
      // this allows us to assert jasmineReporter calls docuWriter in an expected way
      sinon.spy(docuWriter, 'start');
      sinon.spy(docuWriter, 'saveScenario');
      sinon.spy(docuWriter, 'saveUseCase');
      sinon.spy(docuWriter, 'saveBuild');
    });

    after(() => {
      // make sure to remove our spies
      docuWriter.start.restore();
      docuWriter.saveScenario.restore();
      docuWriter.saveUseCase.restore();
      docuWriter.saveBuild.restore();
    });

    it('should invoke docuWriter as expected', () => {

      reporter = jasmineReporter({
        targetDirectory: './test/out/docu',
        branchName: 'reporterTest-lifecycle',
        branchDescription: 'reporterTestBranch',
        buildName: 'reporterTestBuild',
        revision: '0.0.1'
      });

      const dummyObjects = {
        useCaseOne: {
          id: 'suite1',
          description: 'useCase will fail',
          additionalDescription: 'some more info'
        },
        scenarioOne: {
          id: 'spec1',
          description: 'spec will fail',
          additionalDescription: 'more'
        },
        useCaseTwo: {
          id: 'suite2',
          description: 'useCase will succeed',
          additionalDescription: 'some more info juhuu'
        },
        scenarioTwo: {
          id: 'spec2',
          description: 'spec will suceed',
          additionalDescription: 'more juhuu'
        }
      };

      reporter.jasmineStarted();

      // --- first useCase with one failing spec

      reporter.suiteStarted({
        id: dummyObjects.useCaseOne.id,
        description: dummyObjects.useCaseOne.description
      });

      reporter.specStarted({
        id: dummyObjects.scenarioOne.id,
        description: dummyObjects.scenarioOne.description
      });

      reporter.specDone({
        id: dummyObjects.scenarioOne.id,
        description: dummyObjects.scenarioOne.description,
        status: 'failed',
        _suite: {id: dummyObjects.useCaseOne.id, description: dummyObjects.useCaseOne.description}
      });

      reporter.suiteDone({
        isUseCase: true,
        status: 'success',
        id: dummyObjects.useCaseOne.id,
        description: dummyObjects.useCaseOne.description
      });

      // --- second useCase with one succeeding spec

      reporter.suiteStarted({
        id: dummyObjects.useCaseTwo.id,
        description: dummyObjects.useCaseTwo.description
      });

      reporter.specStarted({
        id: dummyObjects.scenarioTwo.id,
        description: dummyObjects.scenarioTwo.description
      });

      reporter.specDone({
        id: dummyObjects.scenarioTwo.id,
        description: dummyObjects.scenarioTwo.description,
        status: 'passed',
        _suite: {id: dummyObjects.useCaseTwo.id, description: dummyObjects.useCaseTwo.description}
      });

      reporter.suiteDone({
        isUseCase: true,
        status: 'finished',
        id: dummyObjects.useCaseTwo.id,
        description: dummyObjects.useCaseTwo.description
      });

      reporter.jasmineDone();


      // Now let's assert that the reporter called docuWriter as expected
      // in general, let's not assert too much -> no complete whitebox test of the reporter -  or this tests gets very brittle


      assert.equal(docuWriter.start.callCount, 1);
      assert.equal(docuWriter.saveScenario.callCount, 2);
      assert.equal(docuWriter.saveUseCase.callCount, 2);
      assert.equal(docuWriter.saveBuild.callCount, 1);

      assert(_.isPlainObject(docuWriter.start.getCall(0).args[0]), 'docuWriter.start must be called with the branch object as first parameter');

      assert.equal(docuWriter.saveScenario.getCall(0).args.length, 2, 'docuWriter.saveUseCase must be called with two argument');
      assert(_.isPlainObject(docuWriter.saveScenario.getCall(0).args[0]), 'docuWriter.saveScenario must be called with the current scenario object as first parameter');
      assert(_.isString(docuWriter.saveScenario.getCall(0).args[1]), 'docuWriter.saveScenario must be called with the useCase name as second parameter');

      assert.equal(docuWriter.saveUseCase.getCall(0).args.length, 1, 'docuWriter.saveUseCase must be called with one argument');
      assert(_.isPlainObject(docuWriter.saveUseCase.getCall(0).args[0]), 'docuWriter.saveUseCase must be called with the current useCase object as first parameter');

      assert.equal(docuWriter.saveBuild.getCall(0).args.length, 1, 'docuWriter.saveBuild must be called with one argument');
      assert(_.isPlainObject(docuWriter.saveBuild.getCall(0).args[0]), 'docuWriter.saveBuild must be called with the build object as first parameter');


    });
  });

});
