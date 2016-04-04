/**
 * An example of an extended DSL that also supports setting more documentation data directly through the DSL.
 *
 * describeUseCase and describeScenario take an additional argument in order to
 * eliminate boilerplate code in your tests to set additional properties of the usecases and scenarios in your documentation.
 *
 * We recommend to use the even better Fluent Custom DSL example for a more cleaner API to use in your tests.
 */
var scenarioo = require('../../lib/index');

function describeUseCase(jasmineDescribeFunction, useCaseName, additionalUseCasePropertiesOrDescribeFunction, describeFunction) {
  var additionalUseCaseProperties = describeFunction ? additionalUseCasePropertiesOrDescribeFunction : null;
  describeFunction = describeFunction ? describeFunction : additionalUseCasePropertiesOrDescribeFunction;
  return jasmineDescribeFunction(useCaseName, function () {

    beforeAll(function () {
      if (additionalUseCaseProperties) {
        scenarioo.getUseCaseContext().setDescription(additionalUseCaseProperties.description);
        scenarioo.getUseCaseContext().addLabels(additionalUseCaseProperties.labels);
        // here you would have to put more code, to support more documentation properties, that you can set on use cases.
      }
    });

    return describeFunction();

  });
}

function describeScenario(jasmineItFunction, scenarioName, additionalScenarioPropertiesOrItFunction, itFunction) {
  var additionalScenarioProperties = itFunction ? additionalScenarioPropertiesOrItFunction : null;
  itFunction = itFunction ? itFunction : additionalScenarioPropertiesOrItFunction;

  jasmineItFunction(scenarioName, function () {
    if (additionalScenarioProperties) {
      scenarioo.getScenarioContext().setDescription(additionalScenarioProperties.description);
      scenarioo.getScenarioContext().addLabels(additionalScenarioProperties.labels);
      // here you would have to put more code, to support more documentation properties, that you can set on scenarios.
    }
    return itFunction();
  });
}

global.describeUseCase = describeUseCase.bind(undefined, describe);
global.fdescribeUseCase = describeUseCase.bind(undefined, fdescribe);
global.xdescribeUseCase = describeUseCase.bind(undefined, xdescribe);

global.describeScenario = describeScenario.bind(undefined, it);
global.fdescribeScenario = describeScenario.bind(undefined, fit);
global.xdescribeScenario = describeScenario.bind(undefined, xit);
