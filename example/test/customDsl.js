/**
 * An example for a custom dsl in order to make 1 useCase -> N scenarios hierarchy more explicit.
 */

function describeUseCase(jasmineDescribeFunction, useCaseName, callback) {
  return jasmineDescribeFunction(useCaseName, callback);
}

function describeScenario(jasmineItFunction, scenarioName, callback) {
  jasmineItFunction(scenarioName, callback);
}

global.describeUseCase = describeUseCase.bind(undefined, describe);
global.fdescribeUseCase = describeUseCase.bind(undefined, fdescribe);
global.xdescribeUseCase = describeUseCase.bind(undefined, xdescribe);

global.describeScenario = describeScenario.bind(undefined, it);
global.fdescribeScenario = describeScenario.bind(undefined, fit);
global.xdescribeScenario = describeScenario.bind(undefined, xit);
