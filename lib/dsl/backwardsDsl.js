'use strict';

/**
 * This is a very basic and simple DSL to describe your tests as usecases and scenarios that is only provided for backward compatibility reasons.
 *
 * If you migrate from an old 1.x ScenariooJS version you can most easily migrate as follows:
 *
 * 1. Setup this DSL by calling following in your protractor onPrepare function:
 *
 * scenarioo.setupBackwardsDsl();
 *
 * 2. Replace all following calls in your tests accordingly:
 *
 * `scenarioo.descibeUseCase(...)` becomes `describeUseCase(...)`
 * `scenarioo.describeScenario(...)` becomes `describeScenario(...)`
 *
 * We recommend to better use the new Fluent DSL of scenarioo in your tests instead of this more backwards compatible DSL.
 */
var scenarioo = require('../index');

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

    /**
     * This is needed in any case (!!) to ensure that the last step (whatever is configured to be saved as last step)
     * is properly written before the spec execution ends.
     */
    afterEach(scenarioo.saveLastStep);

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