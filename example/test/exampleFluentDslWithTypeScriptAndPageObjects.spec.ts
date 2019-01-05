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
import {scenario, useCase,} from '../../lib'; // use 'scenarioo-js' instead of '../../lib' in real project
// label definitions: usually only declared once on setup (no need to import in every test):
import './exampleFluentDslLabelDefinitions';
import {StartPage} from './pages/startPage';

/**
 * The use case description
 */
useCase('Example Use Case with Fluent DSL in TypeScript')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .describe(() => {
    let startPage: StartPage;

    beforeEach(async () => {
      startPage = new StartPage();
      await startPage.goTo();
    });

    /**
     * A scenario description
     */
    scenario('Example Scenario with Fluent DSL and reportStep Decorator')
      .description('An optional but recommended description for the scenario')
      .labels(['happy', 'example-label'])
      .it(async () => {
        // the StartPage constructor navigates us to index.html

        // A step on a decorator could also have additional propoerties, like e.g. labels
        await startPage.assertHeaderShown();

        // do something on the page itself.
        await startPage.selectFirstListItem();
        // assert that the output changed as expected.
        await startPage.assertSelected("one");

        // The methods above are all decorated with the `reportStep` decorator, which lets them record new steps on the
        // scenarioo api as if you would have called scenarioo.saveStep(...).
        // This just helps making your e2e tests way more readable and you need to write less descriptive code.

        // more steps of this scenario would of course come here ...

      });

  });
