import {browser, element, by} from 'protractor';
import {useCase, scenario, step} from '../../lib';

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
      .it(function () {

        browser.get('/index.html');

        // use the step method to document interaction steps inside the scenario (with screenshot, etc.)
        step('browse to start page');
        // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
        // (e.g. by overwriting protractor functions, like click on element)
        // to automatically document a step on each important interaction and not clutter your tests with such calls
        // (actually that is what we recommend for real projects and can be done easily).

        // A step could also have additional propoerties, like e.g. labels (or screen annotations, as you can see in other examples
        // (see pure jasmine example for other possibilities in steps)
        step('a step with labels', {labels: ['step-label-example']});

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
