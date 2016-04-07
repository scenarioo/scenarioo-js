var scenarioo = require('../../lib');

/**
 * An example for a simple basic custom DSL that simply wraps jasmine's "describe" and "it".
 * This makes the usecase -> scenario hierarchy more explicit in the tests.
 *
 * see ../dsl/customDslBasic.js for an example definition of this DSL (included gloably in ptrotractor.conf.js)
 *
 * We recommend to have a look at the most powerful DSL example that we recommend for most projects as a blueprint:
 * sampleCustomDslFluent.js
 */
useCaseDescribe('Example Usecase with Basic Custom DSL', function exampleUseCase() {

  /**
   * Documenting more properties of the use case using scenarioo's use case context.
   * This can be done in a before all block.
   *
   * Look at extended DSL example to improve this.
   */
  beforeAll(function documentUseCase() {
    // setting useCase context properties must be done in a beforeAll block because of the way jasmine
    // executes the tests.
    scenarioo.getUseCaseContext().setDescription('An optional description for the use case');
    scenarioo.getUseCaseContext().addLabels(['example-custom-label']);
  });

  /**
   * This is needed in any case (!!) to ensure that the last step (whatever is configured to be saved as last step)
   * is properly written before the spec execution ends.
   */
  afterEach(scenarioo.saveLastStep);

  /**
   * An example scenario description using basic custom DSLs scenarioIt function
   */
  scenarioIt('Example Scenario with Basic Custom DSL', function exampleScenario() {

    // Optionally you can set more properties on the scenario context for the documentation:
    scenarioo.getScenarioContext().setDescription('an optional description for example scenario');
    scenarioo.getScenarioContext().addLabels(['happy', 'custom-label-for-special-scenario']);

    browser.get('/index.html');

    // use scenarioo's saveStep method to document interaction steps inside the scenario (with screenshot, etc.)
    scenarioo.saveStep('browse to start page');
    // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
    // (e.g. by overwriting protractor functions, like click on element)
    // to automatically document a step on each important interaction and not clutter your tests with such calls
    // (actually that is what we recommend for real projects and can be done easily).



  });

  xscenarioIt('Pending Scenario', function examplePendingScenario() {

  });

});
