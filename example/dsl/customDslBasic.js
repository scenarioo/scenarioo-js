/**
 * A first very basic example of a custom DSL in order to make 1 useCase -> N scenarios hierarchy more explicit in your tests.
 *
 * This is only a very basic hello world example to simply explain the core concept of how to define such a application specific DSL.
 *
 * We recommend to use one of the more advanced DSL examples to cover the full power of ScenariooJS.
 */

function useCaseDescribe(jasmineDescribeFunction, useCaseName, callback) {
  return jasmineDescribeFunction(useCaseName, callback);
}

function scenarioIt(jasmineItFunction, scenarioName, callback) {
  jasmineItFunction(scenarioName, callback);
}

global.useCaseDescribe = useCaseDescribe.bind(undefined, describe);
global.fuseCaseDescribe = useCaseDescribe.bind(undefined, fdescribe);
global.xuseCaseDescribe = useCaseDescribe.bind(undefined, xdescribe);

global.scenarioIt = scenarioIt.bind(undefined, it);
global.fscenarioIt = scenarioIt.bind(undefined, fit);
global.xscenarioIt = scenarioIt.bind(undefined, xit);
