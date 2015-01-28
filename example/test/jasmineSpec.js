var scenarioo = require('scenarioo-js');

/**
 *  This defines a scenarioo "Use Case". It can contain multiple "scenarios".
 *  Scenarioo will generate the appropriate report files (xml) for this use case.
 */
describeUseCase('Example Usecase', 'You can optionally pass in a use case description here', function () {

  /**
   * This defines a scenarioo "scenario".
   * Scenarioo will generate the appropriate report files (xml) for this scenario.
   */
  describeScenario('Example Scenario', 'You can optionally pass in a scenario description here', function () {

    browser.get('http://localhost:8081/index.html');
    scenarioo.docuWriter.saveStep('example-step');

    element(by.css('li#item_one')).click();

    scenarioo.docuWriter.saveStep('example-ste-two');

  });

});

