var scenarioo = require('../index');

/**
 * Fluent DSL to structure your tests for documentation purposes more easily into usecases and scenarios
 * and to use the full power of scenarioo more easily in your e2e tests.
 *
 * This is the most powerful DSL that exposes the full scenarioo features and is most easy to use in your e2e-tests.
 * and even to extend for your own project needs.
 *
 * This DSL provides the following additional features:
 *
 *   - more easy to set additional information on scenarios and usecases (descriptions, labels, ...)
 *   - ensure to write step with screenshot at end of each scenario (on passed and failed tests, which is configurable)
 *   - ensure to validate labels against defined labels in configuration
 *
 * That is why we propose to use this DSL in real projects or to copy it as a blueprint starting point for your own e2e-test DSL.
 *
 * **Usage / Activation:**
 * To activate the DSL you can simply call `scenarioo.setupFluentDsl()` or you can include this dsl source file.
 * For extension you can also copy this file and modify the DSL provided here to your needs.
 *
 * @module
 */

/**
 * Configuration object for the DSL.
 *
 * @type {{useCaseLabels: {}, scenarioLabels: {}, stepLabels: {}}}
 */
var dslConfig = {

  /**
   * Define all the allowed labels that can be applied on use cases, as key value-pairs, undefined labels will fail when set on a use case.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   *
   * @memberof {FluentDsl.dslConfig}
   */
  useCaseLabels: {},

  /**
   * Define all the allowed labels that can be applied on scenarios, as key-value-pairs, undefined labels will fail when set on a scenario.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   */
  scenarioLabels: {},

  /**
   * Define all the allowed labels that can be applied on steps, as key-value-pairs, undefined labels will fail when set on a step.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   */
  stepLabels: {}

};


  /**
 * This type is only available, when you included or activated the Fluent DSL, as described in {@link module:dsl/fluentDsl}.
 *
 * @global
 * @constructor
 */
var FluentDsl = function() {

  /**
   * Configuration object to define config for fluent DSL with default values.
   *
   * You can globaly override this config by simply setting different member values on `scenarioo.fluentDsl.dslConfig`.
   */
  this.dslConfig = dslConfig;

  /**
   * Start describing a use case with this function, that will return a useCase,
   * @param name the name of the use case to describe
   * @returns {{description: description, labels: labels, pending: pending, describe: (function(this:undefined)), xdescribe: (function(this:undefined)), fdescribe: (function(this:undefined))}}
   */
  this.useCase = function(name) {

    var description, labels, pendingMessage;

    return {
      description: function (d) {
        description = d;
        return this;
      },
      labels: function (l) {
        labels = l;
        return this;
      },
      // here you would have to put more functions to support setting more documentation properties, that you can set on use cases.
      pending: function (message) {
        pendingMessage = message;
        return this;
      },
      describe: describeUseCase.bind(undefined, describe),
      xdescribe: describeUseCase.bind(undefined, xdescribe),
      fdescribe: describeUseCase.bind(undefined, fdescribe)
    };

    function describeUseCase(jasmineDescribeFunction, describeCallbackFunction) {

      return jasmineDescribeFunction(name, function () {

        if (pendingMessage) {
          // Use jasmine pending to put pending describe blocks as pending
          pending(pendingMessage);
        }

        beforeAll(function () {
          validateLabels('useCase', fluentDsl.dslConfig.useCaseLabels, labels);
          scenarioo.getUseCaseContext().setDescription(description);
          scenarioo.getUseCaseContext().addLabels(labels);
        });

        /**
         * This is needed in any case (!!) to ensure that the last step (whatever is configured to be saved as last step)
         * is properly written before the spec execution ends.
         */
        afterEach(scenarioo.saveLastStep);

        return describeCallbackFunction();

      });
    }
  };

  /**
   * Start describing a scenario.
   *
   * this function is globaly available when fluentDsl is activated properly.
   *
   * @param name
   * @returns {{description: description, labels: labels, pending: pending, it: (function(this:undefined)), xit: (function(this:undefined)), fit: (function(this:undefined))}}
   */
  this.scenario = function(name) {

    var description, labels, pendingMessage;

    return {
      description: function (d) {
        description = d;
        return this;
      },
      labels: function (l) {
        labels = l;
        return this;
      },
      // here you would have to put more functions to support setting more documentation properties, that you can set on scenarios.
      pending: function (message) {
        pendingMessage = message;
        return this;
      },
      it: describeScenario.bind(undefined, it),
      xit: describeScenario.bind(undefined, xit),
      fit: describeScenario.bind(undefined, fit)
    };

    function describeScenario(jasmineItFunction, itCallbackFunction) {

      if (pendingMessage) {
        // Since there is a known bug with using pending for it blocks and asynchronous protractor tests,
        // we implemented our own pending workaround, still using xit here.
        // See https://github.com/angular/protractor/issues/2454
        var spec = xit(name, executeCallback);
        spec.pend(pendingMessage);
        return spec;
      }
      else {
        jasmineItFunction(name, executeCallback);
      }

      function executeCallback() {
        validateLabels('scenario', fluentDsl.dslConfig.scenarioLabels, labels);
        scenarioo.getScenarioContext().setDescription(description);
        scenarioo.getScenarioContext().addLabels(labels);
        return itCallbackFunction();
      }

    }

  };

  /**
   * Save a step, also validates the passed labels according to `dslConfig`.
   *
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.),
   * or even better, hide this calls in your page objects or hook directly into protractor methods to do a step on each important interaction.
   *
   * @param {string} [stepCaption] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
   * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   **/
  this.step = function(stepCaption, additionalProperties) {
    if (additionalProperties && additionalProperties.labels) {
      validateLabels('step', fluentDsl.dslConfig.stepLabels, additionalProperties.labels);
    }
    return scenarioo.saveStep(stepCaption, additionalProperties);
  };


};

/**
 * The fluentDsl object exposes several functions, that are avaialble as global functions to the e2e tests, in case the fluent DSL was activated using `scenarioo.setupFluentDsl()`.
 *
 * @type {FluentDsl}
 */
export const fluentDsl = new FluentDsl();

function validateLabels(scopeText, definedLabels, labels) {
  if (labels) {
    labels.forEach(function (label) {
      if (!definedLabels[label]) {
        fail('Label "' + label + '" is not defined in your project as a valid label for ' + scopeText + '. Please use `scenarioo.fluentDsl.dslConfig.' + scopeText + 'Labels` to define your labels. Currently defined labels allowed in a ' + scopeText + ' are: ' + JSON.stringify(definedLabels));
      }
    });
  }
}


// just for backwards compatibility with early Release Candidates to not break projects allready using this (undocumented)
global.scenariooDslConfig = dslConfig;

/**
 * Global Fluent-DSL function to use in your e2e tests to define a use case describe block for the scenarioo documentation.
 *
 * This global is only available in your tests if fluentDsl is activated, as described in {@link module:dsl/fluentDsl}
 *
 * @global
 * @type {FluentDsl#scenario}
 */
global.useCase = fluentDsl.useCase;

/**
 * Global Fluent-DSL function to use in your e2e tests to define a test as a scenario for the scenarioo documentation.
 *
 * This global is only available in your tests if fluentDsl is activated, as described in {@link module:dsl/fluentDsl}
 *
 * @global
 * @type {FluentDsl#scenario}
 */
global.scenario = fluentDsl.scenario;

/**
 * Global Fluent-DSL function to use in your e2e tests for reporting a step in the scenarioo documentation of current scenario.
 *
 * This global is only available in your tests if fluentDsl is activated, as described in {@link module:dsl/fluentDsl}
 *
 * @global
 * @type {FluentDsl#step}
 */
global.step = fluentDsl.step;
