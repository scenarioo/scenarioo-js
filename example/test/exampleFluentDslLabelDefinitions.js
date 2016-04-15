/**
 * This example demonstrates how to well define the supported labels in your project's custom DSL.
 */

/**
 * Define all the labels that are allowed to be used on use cases
 */
scenariooDslConfig.useCaseLabels = {
  'example-custom-label': 'Just an example label that is defined to be allowed to be set on usecases, define well which labels you want to use in your project here.'
};

/**
 * Define all the labels that are allowed to be used on scenarios
 */
scenariooDslConfig.scenarioLabels = {
  'happy': 'Happy case scenarios',
  'error': 'Error scenarios that test that the system behaves as expected in error cases',
  'example-label': 'Just an example dummy label that can be set on scenarios'
};
