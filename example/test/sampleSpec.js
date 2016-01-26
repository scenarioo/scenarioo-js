var scenarioo = require('../../lib/scenarioo-js');

/**
 *  This defines a scenarioo "Use Case". It can contain multiple "scenarios".
 *  Scenarioo will generate the appropriate report files (xml) for this use case.
 */
scenarioo.describeUseCase('Example Usecase', 'You can optionally pass in a use case description here', function exampleUseCase() {

    /**
     * This defines a scenarioo "scenario".
     * Scenarioo will generate the appropriate report files (xml) for this scenario.
     */
    scenarioo.describeScenario('Example Scenario', 'You can optionally pass in a scenario description here', function exampleScenario() {

        // write your normal webdriverjs / protractor test-code here

        browser.get('/index.html');

        // use scenarioo's docuWriter to save step information (screenshot, etc.)
        scenarioo.saveStep('start');

        element(by.css('li#item_one')).click();
        expect(element(by.id('selected')).getText('one'));
        scenarioo.saveStep('one is displayed', {
            customInfo: 'This is my custom information that I gathered during test-run.',
            moreCustomInfo: 'It will be displayed as metadata for this step!'
        });

        element(by.css('li#item_two')).click();
        expect(element(by.id('selected')).getText('two'));
        scenarioo.saveStep('two is displayed', {
            complexCustomInfo: [
                'this is a more complex example of metadata',
                'We expect this to end up in valid "entry/key/value" xml'
            ],
            moreComplexCustomInfo: [
                {
                    attributeOne: 'valueOne',
                    attributeTwo: 'valueTwo'
                },
                {
                    attributeOne: 'valueOneOne',
                    attributeTwo: 'valueTwoTwo'
                }
            ]
        });

        element(by.css('li#item_three')).click();
        expect(element(by.id('selected')).getText('three'));
        scenarioo.saveStep('three is displayed');

    });

})
;
