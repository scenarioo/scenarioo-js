// when using the npm module, use `import {fluentDslConfig} from 'scenarioo'` instead
import {fluentDslConfig} from '../../lib';

/**
 * This example demonstrates how to well define the supported labels for the Fluent DSL.
 */

/**
 * Define all the labels that are allowed to be used on use cases
 */
fluentDslConfig.useCaseLabels = {
  'example-custom-label': 'Just an example label that is defined to be allowed to be set on usecases, define well which labels you want to use in your project here.'
};

/**
 * Define all the labels that are allowed to be used on scenarios
 */
fluentDslConfig.scenarioLabels = {
  'happy': 'Happy case scenarios',
  'error': 'Error scenarios that test that the system behaves as expected in error cases',
  'example-label': 'Just an example dummy label that can be set on scenarios'
};

/**
 * Define all the labels that are allowed to be used on steps
 */
fluentDslConfig.stepLabels = {
  'step-label-example': 'just a dummy example for a label on a step'
};
