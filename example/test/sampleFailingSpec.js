var scenarioo = require('../../lib/scenarioo-js');


describe('Example Usecase failing', function exampleFailingUseCase() {
  scenarioo.getUseCaseContext().setDescription('An optional description for a failing useCase');

  it('Example Scenario failing', function exampleFailingScenario() {
    scenarioo.getScenarioContext().setDescription('An optional description for a failing scenario');

    browser.get('/index.html');
    scenarioo.saveStep('start');

    element(by.css('li#item_is_not_present')).click();
    scenarioo.saveStep('one is displayed');

  });

});

