var scenarioo = require('../../lib/scenarioo-js');


/**
 *  This defines a scenarioo "Use Case". It can contain multiple "scenarios".
 *  Scenarioo will generate the appropriate report files (xml) for this use case.
 */
describe('Example Usecase', function exampleUseCase() {

  /**
   * This defines a scenarioo "scenario".
   * Scenarioo will generate the appropriate report files (xml) for this scenario.
   */
  it('Example Scenario', function exampleScenario() {

    // write your normal webdriverjs / protractor test-code here

    browser.get('/index.html');
    // use scenarioo's docuWriter to save step information (screenshot, etc.)
    scenarioo.saveStep('start');

    element(by.css('li#item_one')).click();
    expect(element(by.id('selected')).getText()).toEqual('one');
    scenarioo.saveStep('one is displayed');

    element(by.css('li#item_two')).click();
    expect(element(by.id('selected')).getText()).toEqual('two');
    scenarioo.saveStep('two is displayed');

    element(by.css('li#item_three')).click();
    expect(element(by.id('selected')).getText()).toEqual('three');
    scenarioo.saveStep('three is displayed', {
      screenAnnotations: [{
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        style: 'CLICK',
        clickAction: 'TO_NEXT_STEP'
      }]
    });

  });


  xit('Skipped Scenario', function () {

  });

});
