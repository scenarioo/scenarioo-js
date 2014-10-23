var
  scenarioo = require('../../lib/scenarioo-js');


scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario', function () {
    browser.get('/');
    scenarioo.docuWriter.saveStep('start');

    element(by.css('li#item_one')).click();
    expect(element(by.id('selected')).getText('one'));
    scenarioo.docuWriter.saveStep('one is displayed');

    element(by.css('li#item_two')).click();
    expect(element(by.id('selected')).getText('two'));
    scenarioo.docuWriter.saveStep('two is displayed');

    element(by.css('li#item_three')).click();
    expect(element(by.id('selected')).getText('three'));
    scenarioo.docuWriter.saveStep('three is displayed');

  });

});
