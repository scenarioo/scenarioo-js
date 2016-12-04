import assert from 'assert';
import contextFactory from '../../src/contextFactory';
import store from '../../src/scenariooStore';

describe('contextFactory', () => {

  describe('creating a context', () => {
    it('creates context', () => {
      const context = contextFactory('this-works-with-any-string');
      assert(context);
      assert(context.setDescription);
      assert(context.addLabels);
    });
  });

  describe('setting data', () => {

    beforeEach(() => store.init({
      branchName: 'master',
      branchDescription: 'The master branch',
      buildName: 'nightly',
      revision: '0.1.1-r4444'
    }));

    afterEach(() => store.clear());

    it('should set description on useCase', () => {
      const context = contextFactory('useCase');
      context.setDescription('a dummy description');
      assert.equal(store.getCurrentUseCase().description, 'a dummy description');
    });

    it('should add a single label on useCase', () => {
      const context = contextFactory('useCase');
      context.addLabels('green');
      assert.deepEqual(store.getCurrentUseCase().labels, ['green']);
    });

    it('should add labels on useCase', () => {
      const context = contextFactory('useCase');
      context.addLabels('green');
      context.addLabels(['blue', 'red']);
      assert.deepEqual(store.getCurrentUseCase().labels, ['green', 'blue', 'red']);
    });

    it('should not add undefined labels', () => {
      const context = contextFactory('useCase');
      context.addLabels('green');
      context.addLabels();
      assert.deepEqual(store.getCurrentUseCase().labels, ['green']);
    });

    it('should throw on invalid label', () => {
      // see https://github.com/scenarioo/scenarioo/wiki/Labels
      const context = contextFactory('useCase');
      assert.throws(() => context.addLabels('this * is not allowed'), /does not adhere to format/);
    });


  });


});
