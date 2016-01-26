var
  assert = require('assert'),
  store = require('../../lib/scenariooStore'),
  jasmineReporter = require('../../lib/scenariooJasmineReporter');

describe('scenariooJasmineReporter', function () {
  var reporter;


  // all of these hook functions get invoked by jasmine. let's assert that our scenarioo state is correctly manipulated
  describe('state manipulation', function () {

    beforeEach(function () {
      reporter = jasmineReporter('./test/out/docu', 'reporterTest-state-manipulation', 'reporterTestBranch', 'reporterTestBuild', '0.0.1');
    });

    it('#jasmineStarted()', function () {
      reporter.jasmineStarted({
        totalSpecsDefined: 33
      });

      var state = store.dump();
      assert(state.branch);
      assert(state.build);
      assert(state.build.date);
    });

    it('#suiteStarted()', function () {

      // this is set in "describeScenario"
      store.updateUseCase('suite1', {});

      reporter.suiteStarted({
        id: 'suite1'
      });
      var state = store.dump();
      assert(state.currentUseCase);
      assert.equal(state.currentUseCase.isUseCase, true);
      assert.equal(state.currentUseCase.id, 'suite1');

      // start another suite (nested suite)
      reporter.suiteStarted({
        id: 'suite2'
      });

      assert.equal(store.dump().currentUseCase.id, 'suite1', 'currentUseCase must still be suite1, not suite2');

    });

    it('#specStarted()', function () {

      store.setCurrentUseCase({id: 'suite1'});

      var spec = {
        id: 'spec1'
      };
      reporter.specStarted(spec);

      var state = store.dump();
      assert(state.currentScenario);
      assert.equal(state.currentScenario.id, 'spec1');
      assert.equal(spec._suite.id, 'suite1', 'parent suite (the useCase) must be set');
    });

    it('#specDone() pending', function () {

      store.updateUseCase('suite1', {skippedScenarios: 0});

      reporter.specDone({
        id: 'spec1',
        status: 'pending',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });
      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.useCases.suite1.skippedScenarios, 1);
    });

    it('#specDone() success', function () {

      store.updateUseCase('suite1', {passedScenarios: 0});
      store.updateScenario('My Super Spec', {additionalDescription: 'extended'});

      reporter.specDone({
        id: 'spec1',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.useCases.suite1.passedScenarios, 1);
    });

    it('#specDone() failed', function () {

      store.updateUseCase('suite1', {failedScenarios: 0});
      store.updateScenario('My Super Spec', {additionalDescription: 'extended'});

      reporter.specDone({
        id: 'spec1',
        status: 'failed',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.useCases.suite1.failedScenarios, 1);
    });

  });


  it('whole lifecycle', function () {

    reporter = jasmineReporter('./test/out/docu', 'reporterTest-lifecycle', 'reporterTestBranch', 'reporterTestBuild', '0.0.1');

    var dummyObjects = {
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

    reporter.jasmineStarted({
      totalSpecsDefined: 2
    });

    // --- first useCase with one failing spec

    // this would be set by dsl ("describeUseCase")
    store.updateUseCase(dummyObjects.useCaseOne.id, {
      additionalDescription: dummyObjects.useCaseOne.additionalDescription
    });

    reporter.suiteStarted({
      id: dummyObjects.useCaseOne.id,
      description: dummyObjects.useCaseOne.description
    });

    // this would be set by dsl ("describeScenario")
    store.updateScenario(dummyObjects.scenarioOne.description, {
      additionalDescription: dummyObjects.scenarioOne.additionalDescription
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
      id: dummyObjects.useCaseOne.id,
      description: dummyObjects.useCaseOne.description
    });

    // --- second useCase with one succeeding spec

    // this would be set by dsl ("describeUseCase")
    store.updateUseCase(dummyObjects.useCaseTwo.id, {
      additionalDescription: dummyObjects.useCaseTwo.additionalDescription
    });

    reporter.suiteStarted({
      id: dummyObjects.useCaseTwo.id,
      description: dummyObjects.useCaseTwo.description
    });

    // this would be set by dsl ("describeScenario")
    store.updateScenario(dummyObjects.scenarioTwo.description, {
      additionalDescription: dummyObjects.scenarioTwo.additionalDescription
    });

    reporter.specStarted({
      id: dummyObjects.scenarioTwo.id,
      description: dummyObjects.scenarioTwo.description
    });

    reporter.specDone({
      id: dummyObjects.scenarioTwo.id,
      description: dummyObjects.scenarioTwo.description,
      status: 'success',
      _suite: {id: dummyObjects.useCaseTwo.id, description: dummyObjects.useCaseTwo.description}
    });

    reporter.suiteDone({
      isUseCase: true,
      id: dummyObjects.useCaseTwo.id,
      description: dummyObjects.useCaseTwo.description
    });

    reporter.jasmineDone();

  });

});
