var scenarioo = require('../../lib');

/**
 *  Very basic example protractor test with jasmine to test and document one "Use Case" in scenarioo using ScenariooJS.
 *
 *  Eeach "describe" block is by default documented as a usecase by ScenariooJS and it can contain
 *  multiple "scenarios" (each "it" block is documented as a scenario by the ScenariooJS Jasmine reporter).
 *
 *  ScenariooJS will generate the appropriate report files (xml) for this use case that can be viewed then using the Scenarioo Viewer Webapp.
 *
 *  For more complex real life projects we recommend to introduce a custom DSL in the protractor tests,
 *  to make the usecase/scenario-structure more explicit in the e2e tests and also to more easily
 *  add more information (like descriptions, labels, etc.) into the documentation.
 *
 *  Please refer to the more advanced DSL examples in this same folder to see how to write tests with your own custom DSL
 *  and also for some example DSLs that you could copy and use in your projects (and change where you need to, for project specific stuff).
 */
describe('Example Use Case', function exampleUseCase() {

  /**
   * Documenting more properties of the use case using scenarioo's use case context.
   * This can be done in a before all block.
   */
  beforeAll(function () {
    // setting useCase context properties must be done in a beforeAll block because of the way jasmine
    // executes the tests.
    scenarioo.getUseCaseContext().setDescription('An optional description for the use case');
    scenarioo.getUseCaseContext().addLabels(['example-custom-label']);
  });

  /**
   * This defines a sample scenario to test with protractor and document in Scenarioo.
   * ScenariooJS will generate the appropriate report files (xml) for all it blocks as a scenario inside the usecase.
   */
  it('Example Scenario', function exampleScenario() {

    // Optionally you can set more properties on the scenario context, that you want to document for current scenario:
    scenarioo.getScenarioContext().setDescription('an optional description for example scenario');
    scenarioo.getScenarioContext().addLabels(['happy', 'custom-label-for-special-scenario']);

    // write your normal webdriverjs / protractor test-code here
    browser.get('/index.html');

    // use scenarioo's saveStep method to document interaction steps inside the scenario (with screenshot, etc.)
    scenarioo.saveStep('browse to start page');
    // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
    // (e.g. by overwriting protractor functions, like click on element)
    // to automatically document a step on each important interaction and not clutter your tests with such calls
    // (actually that is what we recommend for real projects and can be done easily).

    element(by.css('li#item_one')).click();
    expect(element(by.id('selected')).getText()).toEqual('one');
    scenarioo.saveStep('one is displayed');

    element(by.css('li#item_two')).click();
    expect(element(by.id('selected')).getText()).toEqual('two');
    scenarioo.saveStep('two is displayed');

    element(by.css('li#item_three')).click();
    expect(element(by.id('selected')).getText()).toEqual('three');
    scenarioo.saveStep('three is displayed', {
      screenAnnotations: [{
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        style: 'CLICK',
        clickAction: 'TO_NEXT_STEP'
      }]
    });

  });

  /**
   * More scenarios would come here, this example one is put to pending with 'xit'.
   */
  xit('Example Pending Scenario', function () {

  });

});
