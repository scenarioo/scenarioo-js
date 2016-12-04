import assert from 'assert';
import store from '../../src/scenariooStore';

describe('scenariooStore', () => {

  beforeEach(() => {
    store.init({
      branchName: 'develop',
      branchDescription: 'The develop branch',
      buildName: 'nightly',
      revision: '0.1.1-r2333'
    });
  });

  describe('#isInitialized()', () => {
    it('should return true after init', () => {
      assert(store.isInitialized());
    });
    it('should return false after clear', () => {
      store.clear();
      assert(!store.isInitialized());
    });
  });

  describe('#getBranch()', () => {
    it('should return branch after init', () => {
      assert.deepEqual(store.getBranch(), {
        description: 'The develop branch',
        name: 'develop'
      });
    });
  });

  describe('#dump()', () => {
    it('should return plain pojo of whole state', () => {
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
          pendingUseCases: 0
        }
      });
    });

    it('cannot dump when not initialized', () => {
      store.clear();
      assert.throws(() => store.dump(), /Store is not initialized/);
    });
  });

  describe('#updateBuild()', () => {

    it('should update build ', () => {
      store.updateBuild({
        someAdditional: 'property'
      });

      assert.equal(store.getBuild().someAdditional, 'property');
    });
  });

  describe('#setBuildDate()', () => {
    it('should set build date ', () => {
      store.setBuildDate(new Date());
      assert(store.getBuild().date);
    });
  });

  describe('#updateCurrentUseCase()', () => {

    it('should create usecase if not yet present ', () => {
      store.updateCurrentUseCase({name: 'testCaseOne'});
      assert.deepEqual(store.getCurrentUseCase(), {name: 'testCaseOne'});
    });

    it('should update usecase', () => {
      store.updateCurrentUseCase({name: 'testCaseOne'}); // creates it
      store.updateCurrentUseCase({additional: 'property'}); // updates it
      assert.deepEqual(store.getCurrentUseCase(), {name: 'testCaseOne', additional: 'property'});
    });

  });

  describe('#resetCurrentUseCase()', () => {

    it('should reset', () => {
      store.getCurrentUseCase(); // creates it
      assert(store.dump().currentUseCase);

      store.resetCurrentUseCase();
      assert(!store.dump().currentUseCase);
    });

  });

  describe('#updateCurrentScenario()', () => {

    it('should create scenario if not yet present ', () => {
      store.updateCurrentScenario({name: 'scone'});
      assert.deepEqual(store.getCurrentScenario(), {name: 'scone'});
    });

    it('should update scenario', () => {
      store.updateCurrentScenario({name: 'scOne'}); // creates it
      store.updateCurrentScenario({additional: 'property'}); // updates it
      assert.deepEqual(store.getCurrentScenario(), {name: 'scOne', additional: 'property'});
    });

  });

  describe('#resetCurrentScenario()', () => {

    it('should reset', () => {
      store.getCurrentScenario(); // creates it
      assert(store.dump().currentScenario);

      store.resetCurrentScenario();
      assert(!store.dump().currentScenario);
    });

  });

  describe('#incrementStepCounter()', () => {

    it('should increment if current scenario set', () => {
      store.getCurrentScenario();
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 0);
    });

    it('should increment if current scenario not yet set (will create currentScenario object)', () => {
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 0);
    });

    it('should increment multiple times', () => {
      store.getCurrentScenario();
      store.incrementStepCounter();
      store.incrementStepCounter();
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 2);
    });

  });

});
