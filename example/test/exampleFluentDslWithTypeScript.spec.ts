/**
 * Example for using the new Scenarioo Fluent DSL with TypeScript Typings of ScenariooJS.
 *
 * For TypeScript typings we only support Fluent DSL as our newest and most comfortable API
 * that is recommended to be used.
 *
 * Precondition for running this example using labels in Fluent DSL:
 * All labels used in Scenarioo Fluent DSL have to be defined before usage.
 * Usually we do this once on starting up the test suite.
 * The example `./exampleFluentDslLabelDefinitions.js` demonstrates the declaration of all labels
 * used in this examples.
 */
import {browser, element, by} from 'protractor';
import {
  useCase,
  scenario,
  step,
  ScreenAnnotationStyle,
  ScreenAnnotationClickAction,
} from '../../lib';  // use 'scenarioo-js' instead of '../../lib' in real project

// label definitions: usually only declared once on setup (no need to import in every test):
import './exampleFluentDslLabelDefinitions';

/**
 * The use case description
 */
useCase('Example Use Case with Fluent DSL in TypeScript')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .describe(() => {

    /**
     * A scenario description
     */
    scenario('Example Scenario with Fluent DSL')
      .description('An optional but recommended description for the scenario')
      .labels(['happy', 'example-label'])
      .it(() => {
        browser.get('/index.html');

        // use the step method to document interaction steps inside the scenario (with screenshot, etc.)
        step('browse to start page');
        // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
        // (e.g. by overwriting protractor functions, like click on element)
        // to automatically document a step on each important interaction and not clutter your tests with such calls
        // (actually that is what we recommend for real projects and can be done easily).

        // A step could also have additional propoerties, like e.g. labels
        step('a step with labels', {labels: ['step-label-example']});

        // Or a step can have screen annotations
        step('a step with a screen annotation', {
          screenAnnotations: [
            {
              region: {x: 20, y: 20, width: 500, height: 30},
              style: ScreenAnnotationStyle.CLICK,
              clickAction: ScreenAnnotationClickAction.TO_NEXT_STEP
            }
          ]
        });

        // more steps of this scenario would of course come here ...

      });

    scenario('Example Failing Scenario with several expectation failures')
      .description('This scenario should demonstrate that also for each failed expectation a screenshot is taken')
      .it(function exampleScenarioWithMultipleExpectationsFailingAndNoLabels() {

        browser.get('/index.html');
        expect(element.all(by.css('.element-not-existing')).count()).toBe(78); // will fail --> expectation failed step

        element(by.css('li#item_one')).click();
        step('item one clicked');

        expect(element.all(by.css('.another-element-not-existing')).count()).toEqual(13); // will fail --> expectation failed step

        element(by.css('li#item_is_not_present')).click(); // will fail the scenario --> scenario failed step
        expect(element.all(by.css('.another-element-not-existing-after-scenario-failed')).count()).toEqual(6); // will not be executed (no step)

      });

    scenario('Example Failing Scenario that throws an Error')
      .description('This scenario just tests that thwoing an Error in a scenario is reported nicely')
      .it(function exampleScenarioWhichThrowsError() {

        throw Error('Something went wrong in a test (this is expected test failure, just for demonstration purposes!)');

      });

    /**
     * Another scenario ...
     * This one is set to pending, which means it is a currently not yet working test (=work in progress)
     */
    scenario('Example Pending Scenario')
      .description('An optional description for the scenario')
      .pending('Put a comment here, why this scenario is currently put to be pending (is recommended to be used in favour of xit!)')
      .it(function examplePendingScenario() {

      });

  });
