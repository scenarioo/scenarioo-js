/**
 * Manually remove a specific build output directory, in case you want to manually control that,
 * e.g. before starting several processes reporting to the same report output directory,
 * which is e.g. needed for parallel running of tests in node js.
 *
 * @param config the config of scenarioo documentation build to clean,
 *               needs target directory, branch name and build name to identify the build directory to clean.
 */
export declare var cleanBuild: (config: ScenariooConfig) => void;

/**
 * Setup method to call in onPrepare of your tests to enable scenarioo reporting for jasmine tests.
 * @param jasmine just pass the global jasmine object here used to register the reporter.
 * @param config: the configuration to set for the scenarioo reporter, configuring this scenarioo build
 */
export declare var setupJasmineReporter: (jasmine: any, config: ScenariooConfig) => void;

/**
 * Configuration of additional propoerties for the fluent DSL.
 * This is the object on which you can add  which labels are allowed to use, in what context.
 */
export declare var fluentDslConfig: FluentDslConfig;

/**
 * Create a scenario by using further Fluent DSL on the resulting object of this factory method.
 */
export declare var useCase: (name: string) => UseCaseDeclaration;

/**
 * Create a scenario by using further Fluent DSL on the resulting object of this factory method.
 */
export declare var scenario: (name: string) => ScenarioDeclaration;

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
export declare var step: (stepCaption: string, additionalProperties?: StepProperties) => PromiseLike<any>;

/**
 * Saves a step in your e2e tests.
 *
 * Use this decorator (http://www.typescriptlang.org/docs/handbook/decorators.html) this in your e2e test functions
 * whenever you want scenarioo to report a step based on a call of a function on a page object.
 *
 * @param {string} [stepDescription?] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
 * if not provided, it will use the following pattern: `{objectName}: {methodName}`.
 * @param {object} [additionalProperties]
 * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
 * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)

 */
export declare var reportStep: (stepDescription?: string, additionalProperties?: StepProperties) => any;

/**
 * Save the last step of a e2e run. Only use that with non-fluent tests (like pretty old jasmine tests)
 *
 * Call this in your e2e test functions at the end of a run:
 *
 * `afterEach(saveLastStep);`
 *
 */
export declare var saveLastStep: () => any;

export interface RecordLastStepForStatusConfig {
  failed: boolean,
  success: boolean
}

/**
 * Configuration object with all configuration properties for setup of scenarioo JS reporter.
 */
export interface ScenariooConfig {


  // target directory: where the scenarioo documentation data is generated
  targetDirectory: string,

  /**
   * Name of the branch in the scenarioo documentation to which you want to report.
   * Usually this is used for major product version (release or feature branches) for which you want to provide and archive
   * different versions of your documentation.
   *
   * If you release your software to different test environments in different versions in parallel,
   * it is helpful to separate such versions by branches, to always have one documentation for each
   * current deployment of your software.
   *
   * Usually you read this from current version control information. But  it does not necessarily have to conform
   * to the real development branch names in your source control, sometimes it is better to use names of the version,
   * release, deployment or whatever it documents.
   *
   * Some usual examples:  "master", "develop", "Version 1.0", "Version 1.1" and so on ...
   */
  branchName: string,

  /**
   * Optional description information for the branch to put into the documentation.
   */
  branchDescription?: string,

  /**
   * Unique build name of the documentation build you are generating.
   *
   * Use a unique timestamp, or better a build ID of current CI build running.
   * Usually fetched from your build server environment (e.g. passed via `process.env`.
   *
   * E.g. for Jenkins see
   * https://wiki.jenkins-ci.org/display/JENKINS/Building+a+software+project#Buildingasoftwareproject-JenkinsSetEnvironmentVariables)
   */
  buildName: string,

  /**
   * Optional revision information of your current software under test.
   *
   * You should put your full product version in combination with the latest source code version control revision here.
   * (either also the build ID or a commit ID)
   */
  revision?: string,

  /**
   * Should scenarioo clean your documentation build output directory before starting reporting to it?
   *
   * If set to true, it will only remove the build directory with same branch and build name
   * of your current documentation report build that you configure on setup of scenarioo.
   *
   * By default this is turned off, becasue for parallel processes reporting to the same build directory,
   * this is not desired to be done on scenarioo setup automatically.
   *
   * If turned off, you should ensure that you use unique build names (see next properties) for each build run
   * or otherwise clean the build directory on your own (see helper function `cleanBuild`).
   */
  cleanBuildOnStart?: boolean,

  /**
   * A function to define what part of the URL to use to identify the page or view
   * you are currently on in the documentation.
   *
   * @param url the full URl the test browser is currently on
   * @return a unique page name from current URL, this should be the part of the URL that identifies the view,
   *         without the base URL and without special page content parameters.
   */
  pageNameExtractor?: (url: string) => string,

  /**
   * Should scenarioo automatically save a step with screenshot for each expectation failure in your test?
   *
   * This is turned off by default.
   */
  reportStepOnExpectationFailed?: boolean,

  /**
   * Enable or disable automatically recording a step (with screenshot) at end of each test.
   * This can be turned on and off for test outcome states (`failed' or `success`) separately.
   *
   * Consider also the other scenarioo jasmine reporter config option 'reportStepOnExpectationFailed',
   * to also take a screenshot for every failed expectation separately, which is recommended.
   */
  recordLastStepForStatus?: RecordLastStepForStatusConfig,

  /**
   * Optional parameter to turn additional scenarioo log outputs off during testing.
   *
   * Scenarioo adds some nice additional log outputs about the progress of your tests,
   * but if you do not like them you can turn them off here.
   *
   * Default is false, which means scenarioo logging is turned on.
   */
  disableScenariooLogOutput?: boolean

}

export interface FluentDslLabelDefinitions {
  [labelName: string]: string;
}

export interface FluentDslConfig {

  /**
   * Define all the allowed labels that can be applied on use cases, as key value-pairs on this object, undefined labels will fail when set on a use case.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   */
  useCaseLabels: FluentDslLabelDefinitions,

  /**
   * Define all the allowed labels that can be applied on scenarios, as key-value-pairs, undefined labels will fail when set on a scenario.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   */
  scenarioLabels: FluentDslLabelDefinitions,

  /**
   * Define all the allowed labels that can be applied on steps, as key-value-pairs, undefined labels will fail when set on a step.
   *
   * key (=property name): the unique label name
   * value: a description of the label
   */
  stepLabels: FluentDslLabelDefinitions

}

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
  screenAnnotations?: ScreenAnnotation[];

}

export interface ScreenAnnotationRegion {
  x: number,
  y: number,
  width: number,
  height: number
}

/**
 * ScreenAnnotation is a rectangular area in your step screenshot that you want to annotate with additional information,
 * like a button that was clicked, a text field that was entered, or any other additional info to display on the screen
 * or to attach to it.
 */
export interface ScreenAnnotation {

  /**
   * the rectangular area in integer values of screen coordinates
   */
  region: ScreenAnnotationRegion,

  /**
   * The style for the annotation. If not set the default style is used.
   */
  style?: ScreenAnnotationStyle,

  /**
   * Optional text to be displkayed directly on screen inside the annotation.
   */
  screenText?: string,

  /**
   * Optional title to be displayed in the info popup when clicking on the annotation icon.
   */
  title?: string,

  /**
   * Optional description text to be displayed in info popup when clicking on the annotation icon
   */
  description?: string,

  /**
   * Optional click action that should happen when user clicks on the rectangular annotation area in the documentation.
   */
  clickAction?: ScreenAnnotationClickAction,

  /**
   * The URL to open in separate browser tab for clickAction = `TO_URL`.
   */
  clickActionUrl?: string,

  /**
   * Text to display as mouse over on the annotation to explain the action that will happen when clicking it.
   */
  clickActionText?: string

}

export type ScreenAnnotationStyle =
  'CLICK' | 'KEYBOARD' | 'EXPECTED' | 'NAVIGATE_TO_URL' | 'ERROR' | 'WARN'
    | 'INFO' | 'HIGHLIGHT' | 'DEFAULT';

export namespace ScreenAnnotationStyle {

  /**
   * Annotation with a mouse click icon, for click interactions in your test.
   */
  export const CLICK: ScreenAnnotationStyle;

  /**
   * Annotation with a keyboard icon for some data entered in your test.
   */
  export const KEYBOARD: ScreenAnnotationStyle;

  /**
   * Annotation with a check mark icon, for expected outcomes that have been checked in your test like data displayed somewhere.
   */
  export const EXPECTED: ScreenAnnotationStyle;

  /**
   * Annotation with a browser navigation icon, for showing URLs the user navigated to or similar things.
   */
  export const NAVIGATE_TO_URL: ScreenAnnotationStyle;

  /**
   * Annotation with an error icon, for arbitrary error annotations
   * or as well fot expectations that have not been successful (w.g. wrong text displayed)
   */
  export const ERROR: ScreenAnnotationStyle;

  /**
   * Annotation with an warning icon, for arbitrary warning annotations.
   */
  export const WARN: ScreenAnnotationStyle;

  /**
   * Annotation with an info icon, for arbitrary information annotations.
   */
  export const INFO: ScreenAnnotationStyle;

  /**
   * Annotations with a highlight icon to mark and annotate arbitrary thing in your screen.
   */
  export const HIGHLIGHT: ScreenAnnotationStyle;

  /**
   * Arbitrary annotations with a generic default annotation icon.
   */
  export const DEFAULT: ScreenAnnotationStyle;
}

export type ScreenAnnotationClickAction = 'TO_NEXT_STEP' | 'TO_URL';

export namespace ScreenAnnotationClickAction {
  /**
   * Click action to go to the next step in this scenario, when clicking on this annotation.
   */
  export const TO_NEXT_STEP: ScreenAnnotationClickAction;

  /**
   * Click action to open a different resource (like additional documentation) in a separate browser tab,
   * when clicking on this annotation in the documentation.
   */
  export const TO_URL: ScreenAnnotationClickAction;
}
