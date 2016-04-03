var scenarioo = require('../../lib');

/**
 * Just an example with a failing test to also check that in the scenarioo documentation you can see when a scenario is failing.
 */
describe('Example Use Case failing', function exampleFailingUseCase() {

  beforeAll(function () {
    // setting useCase context properties must be done in a beforeAll block because of the way jasmine
    // executes the tests.
    scenarioo.getUseCaseContext().setDescription('An optional description for a failing use case');
  });

  it('Example Scenario failing', function exampleFailingScenario() {
    scenarioo.getScenarioContext().setDescription('An optional description for a failing scenario');
    scenarioo.getScenarioContext().addLabels('error'); // you can add a single label
    scenarioo.getScenarioContext().addLabels(['red', 'blue']); // you can add multiple labels

    browser.get('/index.html');
    scenarioo.saveStep('start', {
      labels: ['example-step-label-1', 'example-step-label-2']
    });

    element(by.css('li#item_is_not_present')).click();
    scenarioo.saveStep('one is displayed');

  });

});

