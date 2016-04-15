/**
 * An example of a fluent custom DSL to structure your tests for documentation purposes more easily into usecases and scenarios
 * and to use the full power of scenarioo more easily in your e2e tests.
 *
 * This is the most powerful DSL that is most easy to extend to additional scenarioo features and most easy to use in your e2e-tests.
 *
 * This DSL provides the following additional features:
 * - more easy to set additional information on scenarios and usecases (descriptions, labels, ...)
 * - ensure to write step with screenshot at end of each scenario (on passed and failed tests, which is configurable)
 * - ensure to validate labels against defined labels in configuration
 *
 * That is why we propose to use this DSL in real projects as a blueprint starting point for your own e2e-test DSL.
 */
var scenarioo = require('../index');

/**
 * Global configuration 'scenariooDslConfig' to define config for fluent DSL with default values.
 */
var dslConfig = {

  /**
   * Define all the allowed labels that can be applied on use cases, as key value-pairs, undefined labels will fail when set on a use case.
   *
   * key: the unique label name
   * value: a description of the label
   */
  useCaseLabels: { },

  /**
   * Define all the allowed labels that can be applied on scenarios, as key-value-pairs, undefined labels will fail when set on a scenario.
   *
   * key: the unique label name
   * value: a description of the label
   */
  scenarioLabels: { }

};

function useCase(name) {

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
        validateLabels('useCase', dslConfig.useCaseLabels, labels);
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
}

function scenario(name) {

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
      return xit(name, executeCallback);
    }
    else {
      jasmineItFunction(name, executeCallback);
    }

    function executeCallback() {
      validateLabels('scenario', dslConfig.scenarioLabels, labels);
      scenarioo.getScenarioContext().setDescription(description);
      scenarioo.getScenarioContext().addLabels(labels);
      return itCallbackFunction();
    }

  }

}


function step(stepCaption, additionalProperties) {
  // TODO #18: verify allowed states and labels here
  scenarioo.saveStep(stepCaption, additionalProperties);
}

function validateLabels(scopeText, definedLabels, labels) {
  if (labels) {
    labels.forEach(function (label) {
      if (!definedLabels[label]) {
        fail('Label "' + label + '" is not defined in your project as a valid label for ' + scopeText + '. Please use `scenariooDslConfig.' + scopeText + 'LabelDefinitions` to define your labels. Currently defined labels allowed in a ' + scopeText + ' are: ' + JSON.stringify(definedLabels));
      }
    });
  }
}

global.scenariooDslConfig = dslConfig;
global.useCase = useCase;
global.scenario = scenario;
global.step = step;
