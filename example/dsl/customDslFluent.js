/**
 * An example of a fluent custom DSL to structure your tests for documentation purposes more easily into usecases and scenarios
 * and to use the full power of scenarioo more easily in your e2e tests.
 *
 * This is the most powerful DSL that is most easy to extend to additional scenarioo features and most easy to use in your e2e-tests.
 *
 * That is why we propose to use this DSL in real projects as a blueprint starting point for your own e2e-test DSL.
 */
var scenarioo = require('../../lib/index');

var allowedUseCaseLabels = {
  "example-custom-label": "Just an example label that is defined to be allowed to be set on usecases, define well which labels you want to use in your project here."
};

var allowedScenarioLabels = {
  "happy": "Marker for happy case scenarios",
  "error": "Marker for error scenarios that test that the system behaves as expected in error cases",
  "example-label": "Just an example label that can be set on scenarios"
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
        validateLabels(allowedUseCaseLabels, labels);
        scenarioo.getUseCaseContext().setDescription(description);
        scenarioo.getUseCaseContext().addLabels(labels);
      });

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
      validateLabels(allowedScenarioLabels, labels);
      scenarioo.getScenarioContext().setDescription(description);
      scenarioo.getScenarioContext().addLabels(labels);
      return itCallbackFunction();
    }

  }

}

function validateLabels(definedLabels, labels) {
    // TODO ...
}

global.useCase = useCase;
global.scenario = scenario;
