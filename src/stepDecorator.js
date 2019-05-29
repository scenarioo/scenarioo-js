import scenarioo from './scenarioo-js';

/**
 * Saves a step in your e2e tests.
 *
 * Use this decorator (http://www.typescriptlang.org/docs/handbook/decorators.html) this in your e2e test functions
 * whenever you want scenarioo to report a step based on a call of a function on a page object.
 *
 * @param {string} [description?] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
 * if not provided, it will use the following pattern: `{objectName}: {methodName}`.
 * @param {object} [additionalProperties]
 * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
 * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)
 */
function reportStep(description, additionalProperties) {
  return function (target, propertyKey, descriptor) {

    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const stepDescription = description || `${target.constructor.name}: ${propertyKey}`;

      scenarioo.saveStep(stepDescription, additionalProperties);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export default reportStep;
