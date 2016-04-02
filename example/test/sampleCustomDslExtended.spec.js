var scenarioo = require('../../lib');

/**
 * An extended custom dsl that takes more arguments
 * in order to save the additional "beforeAll" in every test.
 */
describeUseCase('Example Use Case with Extended Custom DSL', {
  description: 'An optional description for the use case',
  labels: ['example-custom-label']
}, function exampleUseCase() {

  describeScenario('Example Scenario with Extended Custom DSL', {
    description: 'an optional description for example scenario',
    labels: ['happy', 'example-label']
  }, function exampleScenario() {

    browser.get('/index.html');

    // use scenarioo's saveStep method to document interaction steps inside the scenario (with screenshot, etc.)
    scenarioo.saveStep('browse to start page');
    // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
    // (e.g. by overwriting protractor functions, like click on element)
    // to automatically document a step on each important interaction and not clutter your tests with such calls
    // (actually that is what we recommend for real projects and can be done easily).

    // more steps of this scenario would of course come here ...

  });

  xdescribeScenario('Example pending scenario', function examplePendingScenario() {

  });

});

