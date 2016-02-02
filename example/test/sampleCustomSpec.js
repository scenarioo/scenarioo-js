var scenarioo = require('../../lib/scenarioo-js');

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
