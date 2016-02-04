var scenarioo = require('../../lib');

/**
 * An example for a simple dsl that simply wraps jasmine's "describe" and "it".
 * It makes the usecase -> scenario hierarchy more explicit
 */
describeUseCase('Example Usecase custom', function exampleUseCase() {

  beforeAll(function () {
    // setting useCase context properties must be done in a beforeAll block because of the way jasmine
    // executes the tests.
    scenarioo.getUseCaseContext().setDescription('An optional description for custom useCase');
  });

  describeScenario('Example Scenario custom', function exampleScenario() {

    browser.get('/index.html');

    scenarioo.saveStep('start');

  });

});

/**
 * An extended custom dsl that takes more arguments in order to save the additional "beforeAll" in every test.
 *
 */
describeUseCaseE('Example Usecase custom-extended', {
  description: 'An optional description for custom-extended useCase',
  labels: ['green', 'red']
}, function exampleUseCase() {

  describeScenarioE('Example Scenario custom-extended', {
    description: 'an optional description for custom-extended scenario'
  }, function exampleScenario() {

    browser.get('/index.html');

    scenarioo.getScenarioContext().addLabels(['blue']);

    scenarioo.saveStep('start');

  });

});

/**
 *  If this style suits you more...
 */
useCase('Example UseCase with custom chained dsl')
  .description('some description for the useCase')
  .labels(['red', 'blue'])
  .has(function () {

    scenario('Example Scenario with custom chained dsl')
      .description('some description for the scenario')
      .labels(['green'])
      .has(function () {

        browser.get('/index.html');

        scenarioo.getScenarioContext().addLabels(['blue']);

        scenarioo.saveStep('start');
      });

  });
