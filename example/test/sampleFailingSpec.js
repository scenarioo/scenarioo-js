var scenarioo = require('../../lib');


describe('Example Usecase failing', function exampleFailingUseCase() {

  beforeAll(function () {
    // setting useCase context properties must be done in a beforeAll block because of the way jasmine
    // executes the tests.
    scenarioo.getUseCaseContext().setDescription('An optional description for a failing useCase');
  });

  it('Example Scenario failing', function exampleFailingScenario() {
    scenarioo.getScenarioContext().setDescription('An optional description for a failing scenario');
    scenarioo.getScenarioContext().addLabels('green'); // you can add a single label
    scenarioo.getScenarioContext().addLabels(['red', 'blue']); // you can add multiple labels

    browser.get('/index.html');
    scenarioo.saveStep('start', {
      labels: ['salmon', 'purple']
    });

    element(by.css('li#item_is_not_present')).click();
    scenarioo.saveStep('one is displayed');

  });

});

