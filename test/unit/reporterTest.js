var assert = require('assert');
var store = require('../../lib/scenariooStore');
var reporter = require('../../lib/reporter');

describe.only('Reporter', function () {

  beforeEach(function () {
    this.rep = reporter({
      targetDirectory: './test/out/docu',
      branchName: 'reporterTest-state-manipulation',
      branchDescription: 'reporterTestBranch',
      buildName: 'reporterTestBuild',
      revision: '0.0.1'
    });
  });

  afterEach(function () {
    store.clear();
  });

  describe('#runStarted()', function () {

    it('successful', function () {
      this.rep.runStarted();
    });

    it('fail on already started', function () {
      this.rep.runStarted();

      assert.throws(function () {
        this.rep.runStarted();
      }.bind(this), /Run already started/);
    });

  });

  describe('#runEnded()', function () {
    it('successful ended and cleared store', function () {
      this.rep.runEnded();

      assert.throws(function () {
        store.dump();
      }, /Store is not initialized!/);
    });
  });

  describe('#useCaseStarted()', function () {

    it('successful', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
    });

    it('fail if id missing', function () {
      this.rep.runStarted();
      assert.throws(function () {
        this.rep.useCaseStarted();
      }.bind(this), /Please provide a useCaseId/);
    });

    it('fail if run not started', function () {
      assert.throws(function () {
        this.rep.useCaseStarted('uc1');
      }.bind(this), /Cannot start useCase, run was not started!/);
    });

  });

  describe('#scenarioStarted()', function () {

    it('successful', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');
    });

    it('fail if id missing', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      assert.throws(function () {
        this.rep.scenarioStarted();
      }.bind(this), /Please provide a scenarioId/);
    });

    it('fail if useCase not started', function () {
      this.rep.runStarted();

      assert.throws(function () {
        this.rep.scenarioStarted('sc1');
      }.bind(this), /Cannot start scenario, useCase was not started!/);
    });

  });

  describe('#scenarioEnded()', function () {

    it('successful (with state successful)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');
      this.rep.scenarioEnded('sc1', this.rep.SUCCESSFUL);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.passedScenarios, 1);
    });

    it('successful (with state failed)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');
      this.rep.scenarioEnded('sc1', this.rep.FAILED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.failedScenarios, 1);
    });

    it('successful (with state skipped)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');
      this.rep.scenarioEnded('sc1', this.rep.SKIPPED);

      // parent useCase must be updated
      var useCase = store.getUseCase('uc1');
      assert.equal(useCase.skippedScenarios, 1);
    });

    it('fail if id is missing', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');

      assert.throws(function () {
        this.rep.scenarioEnded();
      }.bind(this), /Please provide a scenarioId/);
    });

    it('fail if id does not match started scenario', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.scenarioStarted('sc1');

      assert.throws(function () {
        this.rep.scenarioEnded('sc2');
      }.bind(this), /Cannot end scenario 'sc2', current scenario is 'sc1'/);
    });

    it('fail if scenario not started', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');

      assert.throws(function () {
        this.rep.scenarioEnded('sc1', this.rep.SUCCESSFUL);
      }.bind(this), /Cannot end scenario, no scenario was started!/);
    });

  });


  describe('#useCaseEnded()', function () {

    it('successful (with state successful)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.useCaseEnded('uc1', reporter.SUCCESSFUL);

      // build  must be updated
      var build = store.getBuild();
      assert.equal(build.passedUseCases, 1);
    });

    it('successful (with state failed)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.useCaseEnded('uc1', reporter.FAILED);

      // build must be updated
      var build = store.getBuild();
      assert.equal(build.failedUseCases, 1);
    });

    it('successful (with state skipped)', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');
      this.rep.useCaseEnded('uc1', reporter.SKIPPED);

      // build must be updated
      var build = store.getBuild();
      assert.equal(build.skippedUseCases, 1);
    });

    it('fail if id is missing', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');

      assert.throws(function () {
        this.rep.useCaseEnded();
      }.bind(this), /Please provide a useCaseId/);
    });

    it('fail if id does not match started UseCase', function () {
      this.rep.runStarted();
      this.rep.useCaseStarted('uc1');

      assert.throws(function () {
        this.rep.useCaseEnded('uc2');
      }.bind(this), /Cannot end useCase 'uc2', current useCase is 'uc1'/);
    });

    it('fail if useCase not started', function () {
      this.rep.runStarted();

      assert.throws(function () {
        this.rep.useCaseEnded('uc1', this.rep.SUCCESSFUL);
      }.bind(this), /Cannot end useCase, no useCase was started!/);
    });
  });

});
