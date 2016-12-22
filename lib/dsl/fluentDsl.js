'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = undefined;
exports.useCase = useCase;
exports.scenario = scenario;
exports.step = step;

var _scenariooJs = require('../scenarioo-js');

var _scenariooJs2 = _interopRequireDefault(_scenariooJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Configuration 'scenarioo.fluentDslConfig' to define config for fluent DSL with default values.
 */
var config = exports.config = {

  /**
   * Define all the allowed labels that can be applied on use cases, as key value-pairs, undefined labels will fail when set on a use case.
   *
   * key (=property name): the unique label name
   * value: a description of the label
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

}; /**
    * An example of a fluent custom DSL to structure your tests for documentation purposes more easily into usecases and scenarios
    * and to use the full power of scenarioo more easily in your e2e tests.
    *
    * This is the most powerful DSL that is most easy to extend to additional scenarioo features and most easy to use in your e2e-tests.
    *
    * This DSL provides the following additional features:
    *
    *   - more easy to set additional information on scenarios and usecases (descriptions, labels, ...)
    *   - ensure to write step with screenshot at end of each scenario (on passed and failed tests, which is configurable)
    *   - ensure to validate labels against defined labels in configuration
    *
    * That is why we propose to use this DSL in real projects as a blueprint starting point for your own e2e-test DSL.
    */
function useCase(name) {

  var _description, _labels, pendingMessage;

  return {
    description: function description(d) {
      _description = d;
      return this;
    },
    labels: function labels(l) {
      _labels = l;
      return this;
    },
    // here you would have to put more functions to support setting more documentation properties, that you can set on use cases.
    pending: function pending(message) {
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
        validateLabels('useCase', config.useCaseLabels, _labels);
        _scenariooJs2.default.getUseCaseContext().setDescription(_description);
        _scenariooJs2.default.getUseCaseContext().addLabels(_labels);
      });

      /**
       * This is needed in any case (!!) to ensure that the last step (whatever is configured to be saved as last step)
       * is properly written before the spec execution ends.
       */
      afterEach(_scenariooJs2.default.saveLastStep);

      return describeCallbackFunction();
    });
  }
}

function scenario(name) {

  var _description2, _labels2, pendingMessage;

  return {
    description: function description(d) {
      _description2 = d;
      return this;
    },
    labels: function labels(l) {
      _labels2 = l;
      return this;
    },
    // here you would have to put more functions to support setting more documentation properties, that you can set on scenarios.
    pending: function pending(message) {
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
    } else {
      jasmineItFunction(name, executeCallback);
    }

    function executeCallback() {
      validateLabels('scenario', config.scenarioLabels, _labels2);
      _scenariooJs2.default.getScenarioContext().setDescription(_description2);
      _scenariooJs2.default.getScenarioContext().addLabels(_labels2);
      return itCallbackFunction();
    }
  }
}

/*
 * Save a step, also validates the passed labels according to `scenarioo.fluentDslConfig`.
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
function step(stepCaption, additionalProperties) {
  if (additionalProperties && additionalProperties.labels) {
    validateLabels('step', config.stepLabels, additionalProperties.labels);
  }
  return _scenariooJs2.default.saveStep(stepCaption, additionalProperties);
}

function validateLabels(scopeText, definedLabels, labels) {
  if (labels) {
    labels.forEach(function (label) {
      if (!definedLabels[label]) {
        fail('Label "' + label + '" is not defined in your project as a valid label for ' + scopeText + '. Please use `scenarioo.fluentDslConfig.' + scopeText + 'Labels` to define your labels. Currently defined labels allowed in a ' + scopeText + ' are: ' + JSON.stringify(definedLabels));
      }
    });
  }
}

// just for backwards compatibility, for those projects allready using these globals.
// you should instead import it from library root (index --> scenarioo object).
global.scenariooDslConfig = config;
global.useCase = useCase;
global.scenario = scenario;
global.step = step;