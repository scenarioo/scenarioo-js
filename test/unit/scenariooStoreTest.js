var
  assert = require('assert'),
  store = require('../../src/scenariooStore');

describe('scenariooSore', function () {

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
        }
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

  describe('#updateCurrentUseCase()', function () {

    it('should create usecase if not yet present ', function () {
      store.updateCurrentUseCase({name: 'testCaseOne'});
      assert.deepEqual(store.getCurrentUseCase(), {name: 'testCaseOne'});
    });

    it('should update usecase', function () {
      store.updateCurrentUseCase({name: 'testCaseOne'}); // creates it
      store.updateCurrentUseCase({additional: 'property'}); // updates it
      assert.deepEqual(store.getCurrentUseCase(), {name: 'testCaseOne', additional: 'property'});
    });

  });

  describe('#resetCurrentUseCase()', function () {

    it('should reset', function () {
      store.getCurrentUseCase(); // creates it
      assert(store.dump().currentUseCase);

      store.resetCurrentUseCase();
      assert(!store.dump().currentUseCase);
    });

  });

  describe('#updateCurrentScenario()', function () {

    it('should create scenario if not yet present ', function () {
      store.updateCurrentScenario({name: 'scone'});
      assert.deepEqual(store.getCurrentScenario(), {name: 'scone'});
    });

    it('should update scenario', function () {
      store.updateCurrentScenario({name: 'scOne'}); // creates it
      store.updateCurrentScenario({additional: 'property'}); // updates it
      assert.deepEqual(store.getCurrentScenario(), {name: 'scOne', additional: 'property'});
    });

  });

  describe('#resetCurrentScenario()', function () {

    it('should reset', function () {
      store.getCurrentScenario(); // creates it
      assert(store.dump().currentScenario);

      store.resetCurrentScenario();
      assert(!store.dump().currentScenario);
    });

  });

  describe('#incrementStepCounter()', function () {

    it('should increment if current scenario set', function () {
      store.getCurrentScenario();
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 0);
    });

    it('should increment if current scenario not yet set (will create currentScenario object)', function () {
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 0);
    });

    it('should increment multiple times', function () {
      store.getCurrentScenario();
      store.incrementStepCounter();
      store.incrementStepCounter();
      store.incrementStepCounter();
      assert.equal(store.getCurrentScenario().stepCounter, 2);
    });

  });

});
