var scenarioo = require('../../lib/scenarioo-js');


scenarioo.describeUseCase('Example Usecase failing', function exampleFailingUseCase() {

  scenarioo.describeScenario('Example Scenario failing', function exampleFailingScenario() {
    browser.get('/index.html');
    scenarioo.docuWriter.saveStep('start');

    element(by.css('li#item_is_not_present')).click();
    scenarioo.docuWriter.saveStep('one is displayed');

  });

});
