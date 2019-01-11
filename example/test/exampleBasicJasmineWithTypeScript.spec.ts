/**
 * Example for using the Scenarioo with TypeScript Typings of ScenariooJS and plain old Jasmine.
 *
 * For TypeScript, not all typings are supported as the Fluent DSL is recommended.
 */
import {saveLastStep} from '../../lib'; // use 'scenarioo-js' instead of '../../lib' in real project
import {StartPage} from './pages/startPage';

let startPage: StartPage;

describe('Example Use Case in Typescript with Page Objects and @reportStep', () => {

  /**
   * This is needed in any case (!!) to ensure that the last step (whatever is configured to be saved as last step)
   * is properly written before the spec execution ends. Using new scenarioo Fluent DSL this would not be needed.
   */
  afterEach(saveLastStep);

  beforeEach(async () => {
    startPage = new StartPage();
    await startPage.navigateToPage();
  });

  /**
   * This defines a sample scenario to test with protractor and document in Scenarioo.
   *
   * ScenariooJS will generate the appropriate report files (xml) for all it blocks as a scenario inside the usecase.
   *
   * The `StartPage` object will use the provided Annotation to automatically create scenario-steps after a method has
   * been called that was annotated with `@reportStep()` on the page objects.
   * With this you don't have to write `scenarioo.saveStep()` in every test.
   */
  it('Example Scenario with step annotation', async () => {
    await startPage.selectFirstListItem();
    await startPage.assertSelected('one');

    await startPage.clickSecondListItem();
    await startPage.assertSelected('two');
  });

});
