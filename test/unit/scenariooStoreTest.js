var
  assert = require('assert'),
  store = require('../../lib/scenariooStore');

describe('scenariooSTore', function () {

  beforeEach(function () {
    store.init({
      branchName: 'develop',
      branchDescription: 'The develop branch',
      buildName: 'nightly',
      revision: '0.1.1-r2333'
    });
  });

  describe('#isInitialized()', function () {
    it('should return true after init', function () {
      assert(store.isInitialized());
    });
    it('should return false after clear', function () {
      store.clear();
      assert(!store.isInitialized());
    });
  });

  describe('#getBranch()', function () {
    it('should return branch after init', function () {
      assert.deepEqual(store.getBranch(), {
        description: 'The develop branch',
        name: 'develop'
      });
    });
  });

  describe('#dump()', function () {
    it('should return plain pojo of whole state', function () {
      assert.deepEqual(store.dump(), {
        branch: {
          name: 'develop',
          description: 'The develop branch'
        },
        build: {
          name: 'nightly',
          revision: '0.1.1-r2333',
          passedUseCases: 0,
          failedUseCases: 0,
          skippedUseCases: 0
        },
        currentScenario: undefined,
        currentUseCase: undefined,
        useCases: {},
        scenarios: {}
      });
    });

    it('cannot dump when not initialized', function () {
      store.clear();
      assert.throws(function () {
        store.dump();
      }, /Store is not initialized/);
    });
  });

  describe('#updateBuild()', function () {

    it('should update build ', function () {
      store.updateBuild({
        someAdditional: 'property'
      });

      assert.equal(store.getBuild().someAdditional, 'property');
    });
  });

  describe('#setBuildDate()', function () {
    it('should set build date ', function () {
      store.setBuildDate(new Date());
      assert(store.getBuild().date);
    });
  });

  describe('#updateUseCase()', function () {

    it('should create usecase if not yet present ', function () {
      store.updateUseCase('uc-super');
      assert.deepEqual(store.getUseCase('uc-super'), {id: 'uc-super'});
    });

    it('should update usecase', function () {
      store.updateUseCase('uc-super'); // create it
      store.updateUseCase('uc-super', {additional: 'stuff'}); // update it
      assert.deepEqual(store.getUseCase('uc-super'), {
        id: 'uc-super',
        additional: 'stuff'
      });
    });

  });

  describe('current use case setting', function () {

    it('should return undefined if no use case is set', function () {
      assert.equal(store.getCurrentUseCase(), undefined);
    });

    it('should return undefined if use case id is set to unknown useCase', function () {
      store.setCurrentUseCaseId('uc-not-in-the-store');
      assert.equal(store.getCurrentUseCase(), undefined);
    });

    it('should return current usecase if correctly set', function () {
      store.updateUseCase('uc1'); // creates useCase "uc1"
      store.setCurrentUseCaseId('uc1');
      assert.deepEqual(store.getCurrentUseCase(), {id: 'uc1'});
    });

  });

  describe('#updateScenario()', function () {

    it('should create scenario if not yet present ', function () {
      store.updateScenario('top-sc');
      assert.deepEqual(store.getScenario('top-sc'), {id: 'top-sc'});
    });

    it('should update scenario', function () {
      store.updateScenario('top-sc'); // create it
      store.updateScenario('top-sc', {additional: 'stuff'}); // update it
      assert.deepEqual(store.getScenario('top-sc'), {
        id: 'top-sc',
        additional: 'stuff'
      });
    });

  });

  describe('current scenario setting', function () {

    it('should return undefined if no scenario is set', function () {
      assert.equal(store.getCurrentScenario(), undefined);
    });

    it('should return undefined if scenario id is set to unknown scenario', function () {
      store.setCurrentScenarioId('sc-not-in-the-store');
      assert.equal(store.getCurrentScenario(), undefined);
    });

    it('should return current scenario if correctly set', function () {
      store.updateScenario('sc1'); // creates scenario "sc1"
      store.setCurrentScenarioId('sc1');
      assert.deepEqual(store.getCurrentScenario(), {id: 'sc1'});
    });

  });

  describe('#incrementStepCounter()', function () {

    it('should increment if current scenario set', function () {
      store.updateScenario('sc1');
      store.setCurrentScenarioId('sc1');
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 0);
    });

    it('should increment multiple times', function () {
      store.updateScenario('sc1');
      store.setCurrentScenarioId('sc1');
      store.incrementStepCounter();
      store.incrementStepCounter();
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 2);
    });

    it('should throw if no current scenario set', function () {
      assert.throws(function () {
        store.incrementStepCounter();
      }, /Cannot increment step counter. No Current Scenario set/);
    });

  });

});
