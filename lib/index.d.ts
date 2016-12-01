/**
 * Fluent DSL to declare further options of a Use Case, returned by function `useCase`.
 */
export interface UseCaseDeclaration {

  /**
   * Add a description to this use case
   * @param description the description for this scenario
   */
  description(description: string): UseCaseDeclaration;

  /**
   * Add one or multiple labels
   * @param labels the labels to add.
   */
  labels(labels: string[]): UseCaseDeclaration;

  /**
   * Mark this use case as pending, which means it will be marked as "work in progress"
   * and all contained scenarios will not be executed when running the tests.
   * @param reason the reason why this is currently pending work. It is highly recommended to reference here the task,
   *               issue or story number ot the ticket where it is planned to resolve it,
   *               and/or the person currently working on it and responsible to resolve it.
   */
  pending(reason: string): UseCaseDeclaration;

  /**
   * Define the use case implementation as a function which will be run as the jasmine describe function for this scenario.
   * @param useCaseImpl the use case describe block implementation, usually containing the `scenario`-blocks.
   */
  describe(useCaseImpl: () => void): void;

  /**
   * Define the use case implementation to run in focused tests, only for locally running selected tests.
   * You should never commit a call to this function.
   * We recommend to define a git pre commit hook to prevent developers from committing such calls.
   * @param useCaseImpl the use case describe block implementation
   */
  fdescribe(useCaseImpl: () => void): void;

  /**
   * Temporarily ignored use case implementation, only for local work in progress.
   * You should never commit a call to this function.
   * We recommend to define a git pre commit hook to prevent developers from committing such calls.
   * Use instead `pending` before the `describe` call to mark tests as pending with a reason.
   * @param useCaseImpl the use case describe block implementation
   */
  xdescribe(useCaseImpl: () => void): void;

}

/**
 * Create a scenario by using further Fluent DSL on the resulting object of this factory method.
 */
declare var useCase: (name: string) => UseCaseDeclaration;

/**
 * Fluent DSL to declare further options of a Scenario, returned by function `scenario`.
 */
export interface ScenarioDeclaration {

  /**
   * Add a description to this sceanrio
   * @param description the description for this scenario
   */
  description(description: string): ScenarioDeclaration;

  /**
   *
   * @param labels
   */
  labels(labels: string[]): ScenarioDeclaration;

  /**
   * Mark this use caae as pending, which means it will be marked as "work in progress"
   * and all contained scenarios will not be executed when running the tests.
   * @param reason the reason why this is currently pending work. It is highly recommended to reference here the task,
   *               issue or story number ot the ticket where it is planned to resolve it,
   *               and/or the person currently working on it and responsible to resolve it.
   */
  pending(reason: string): ScenarioDeclaration;

  /**
   * Define the scenario implementation as a function which will be run as the jasmine it function for this scenario.
   * @param testImpl the test (jasmine it block) implementation
   */
  it(testImpl: () => void): void;

  /**
   * Define the scenario implementation to run in focused tests, only for locally running selected tests.
   * You should never commit a call to this function.
   * We recommend to define a git pre commit hook to prevent developers from committing such calls.
   * @param testImpl the test (jasmine it block) implementation
   */
  fit(testImpl: () => void): void;

  /**
   * Temporarily ignored scenario implementation, only for local work in progress.
   * You should never commit a call to this function.
   * We recomment to define a git pre commit hook to prevent developers from commiting such calls.
   * Use instead `pending` before the `it` call to mark tests as pending with a reason.
   * @param testImpl the use case describe block implementation
   */
  xit(testImpl: () => void): void;

}

/**
 * Create a scenario by using further Fluent DSL on the resulting object of this factory method.
 */
declare var scenario: (name: string) => ScenarioDeclaration;

/**
 * Properties that can be passed to a step when recording steps using the `step` function.
 */
export interface StepProperties {

  /**
   * Array with labels, if any
   */
  labels?: string[];

  /**
   * Screen annotations: ... needs to be typed further. work in progress.
   */
  screenAnnotations?: any[];

}

/**
 * Save a step, also validates the passed labels according to global `scenariooDslConfig`.
 *
 * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.),
 * or even better, hide this calls in your page objects or hook directly into protractor methods to do a step on each important interaction.
 *
 * @param {string} [stepCaption] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
 * @param {object} [additionalProperties]
 * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
 * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)
 * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
 */
declare var step: (stepCaption: string, additionalProperties?: StepProperties) => any;

export declare var scenarioo: {

  /**
   * Inititalize Scenarioo to work as a Jasmine reporter, to report all jasmine tests.
   * @param jasmine jasmine itself to use for registering the jasmine reporter.
   * @param config the config, see scenarioo documentation for propoerties you can or must set on the scenarioo config object.
   */
  setupJasmineReporter: (jasmine:any, config:any) => void;

  /**
   * Needs to be called to enable the Fluent DSL, in addition to setting up the JasmineReporter
   * (needs be called separately).
   */
  setupFluentDsl: () => void;

};
