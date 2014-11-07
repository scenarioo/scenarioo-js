var scenarioo = require('../../lib/scenarioo-js');


scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario', function () {
    browser.get('/');
    scenarioo.docuWriter.saveStep('start');

    element(by.css('li#item_one')).click();
    expect(element(by.id('selected')).getText('one'));
    scenarioo.docuWriter.saveStep('one is displayed', {
      customInfo: 'This is my custom information that I gathered during test-run.',
      moreCustomInfo: 'It will be displayed as metadata for this step!'
    });

    element(by.css('li#item_two')).click();
    expect(element(by.id('selected')).getText('two'));
    scenarioo.docuWriter.saveStep('two is displayed',{
      complexCustomInfo: [
        'this is a more complex example of metadata',
        'We expect this to end up in valid "entry/key/value" xml'
      ],
      moreComplexCustomInfo: [
        {
          attributeOne:'valueOne',
          attributeTwo:'valueTwo'
        },
        {
          attributeOne:'valueOneOne',
          attributeTwo:'valueTwoTwo'
        }
      ]
    });

    element(by.css('li#item_three')).click();
    expect(element(by.id('selected')).getText('three'));
    scenarioo.docuWriter.saveStep('three is displayed');

  });

})
;
