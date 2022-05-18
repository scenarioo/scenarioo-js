"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _contextFactory = _interopRequireDefault(require("./contextFactory"));

var _docuWriter = _interopRequireDefault(require("./docuWriter/docuWriter"));

var _jasmine = _interopRequireDefault(require("./reporters/jasmine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @namespace scenarioo
 */
var scenarioo = {
  /**
   * Will be set to true, when reporting is enabled. All calls to scenarioo functionalities (like writer functions), will not write anything, if this is set to false.
   *
   * This is helpful to not clutter your test code everywhere with code of the form `if (scenariooDocuEnabled) { scenarioo.saveStep(...) }`, you can simply use `scenarioo.saveStep(...)` or other similar scenarioo calls in your code, and you can be sure, that they not write any documentation, if scenarioo is not enabled.
   */
  reportingEnabled: false,

  /**
   * Configuration. This is the globaly available currently set configuration, that you usually passed in the call to the setupJasmineReporter(...) function for setting up the scenarioo reporter and writer.
   */
  options: {},

  /**
   * Programmatically clean the build directory before tests are started.
   */
  cleanBuild: function cleanBuild(config) {
    _docuWriter["default"].cleanBuild(config);
  },

  /**
   * Instantiates the scenarioo reporter for jasmine and registers it with the jasmine environment. `
   *
   * Usually this is invoked in your protractor config file to setup scenarioo documentation generation.
   *
   * @func scenarioo#setupJasmineReporter
   * @param {object} jasmine - pass the jasmine instance to use for setup (usualy just the global 'jasmine' variable)
   * @param {object} options - an object containing configuration properties for the scenarioo reporter and documentation writer
   * @param {string} options.targetDirectory - the path to the root target directory where the generated documentation will be generated
   * @param {string} options.branchName - the display name to use for the branch in the documentation, this is also used as identifier in URLs to reference a documentation of a specific branch
   * @param {string} [options.branchDescription] - an optional description for the documentation branch
   * @param {string} options.buildName - the display name to use for the generated documentation build, this is also the identifier to use in URLs to reference this version of the generated documentation
   * @param {string} [options.revision] - optional revision or version number of the software under test (usually taken from source control)
   * @param {function} [options.pageNameExtractor] - A custom function to extract the pageName from the url. Scenarioo will pass in a node.js url object.
   *
   */
  setupJasmineReporter: function setupJasmineReporter(jasmine, options) {
    scenarioo.reportingEnabled = true;

    if (options) {
      scenarioo.options = options;
    }

    var reporter = (0, _jasmine["default"])(jasmine, scenarioo.options);
    jasmine.getEnv().addReporter(reporter);
  },

  /**
   * Setup the backwards DSL which defines global functions `defineUseCase` and `defineScenario` to replace old
   * `scenarioo.defineScenario` and `scenarioo.defineUseCase` functions for more easily migrating from tests
   * using old version 1.x of ScenariooJS.
   *
   * Instead of using this DSL for easy migration we recommend to migrate your tests to use the new Fluent DSL
   * (or it is also possible to use both DSLs in parallel to more easily migrate step by step to using the new DSL).
   *
   * See examples for how to use it.
   */
  setupBackwardsDsl: function setupBackwardsDsl() {
    require('./dsl/backwardsDsl.js');

    scenarioo.describeUseCase = describeUseCase;
    scenarioo.describeScenario = describeScenario;
  },

  /**
   * @deprecated
   *
   * Setup the new Fluent DSL to write e2e tests with scenarioo more easily.
   *
   * This defines global functions `usecase`, `scenario` and `step` to use for describing your e2e tests.
   *
   * This is deprecated:
   * you could also use the fluent DSL without having to call this activation function anymore, cause it is exposed by default when loading index.js.
   *
   * See examples for how to use Fluent DSL.
   */
  setupFluentDsl: function setupFluentDsl() {
    // Just import to define the globals
    require('./dsl/fluentDsl.js');
  },

  /**
   * Will return the context for the current useCase.
   * Allows you to set additional information like "description" and "labels".
   *
   * If you are using the Fluent DSL, you will not need it, the fluent DSL allows you to set this properties more easily.
   *
   * @func scenarioo#getUseCaseContext
   * @returns {context}
   */
  getUseCaseContext: function getUseCaseContext() {
    return (0, _contextFactory["default"])('useCase');
  },

  /**
   * Will return the context for the current scenario.
   * Allows you to set additional information like "description" and "labels"
   *
   * If you are using the Fluent DSL, you will not need it, the fluent DSL allows you to set this properties more easily.
   *
   * @func scenarioo#getScenarioContext
   * @returns {context}
   */
  getScenarioContext: function getScenarioContext() {
    return (0, _contextFactory["default"])('scenario');
  },

  /**
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @func scenarioo#saveStep
   * @param {string} [stepCaption] - optional description text for the step to be recorded, will be displayed in `title` field of a step in scenarioo.
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels] - array of strings, labels are special keywords to label steps that have something in common.
   * @param {object[]} [additionalProperties.screenAnnotations] - screenAnnotations are special objects to highlight rectangular areas in the screenshot and attach additional documentation data tot his areas (e.g. for clicked elements, or text typed by the user, etc.)
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   **/
  saveStep: function saveStep() {
    if (!scenarioo.reportingEnabled) {
      return; // just do nothing when scenarioo is disabled.
    }

    var stepArguments = arguments;
    return _docuWriter["default"].saveStep.apply(_docuWriter["default"], stepArguments);
  },

  /**
   * MUST be called in an afterEach (and only in afterEach!), to ensure that all steps are written before the test is finished.
   *
   * If you are using the new fluent DSL, you do not have to care about it, since done by the DSL already for you.
   *
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   */
  saveLastStep: function saveLastStep() {
    if (!scenarioo.reportingEnabled) {
      return; // just do nothing when scenarioo is disabled.
    }

    var status = scenarioo.getScenarioContext().getCurrent().status;
    status = status || 'success'; // not yet set = assuming success.

    if (scenarioo.options.recordLastStepForStatus) {
      if (scenarioo.options.recordLastStepForStatus[status]) {
        // Put a label on failure steps
        var labels = [];

        if (status === 'failed') {
          labels = ['failed'];
        } // Report step with status and failure label


        return scenarioo.saveStep('scenario ' + status, {
          status: status,
          labels: labels
        });
      }
    }
  },

  /**
   * Enum constants to use as values for ScreenAnnotation field `style`.
   */
  ScreenAnnotationStyle: {
    CLICK: 'CLICK',
    KEYBOARD: 'KEYBOARD',
    EXPECTED: 'EXPECTED',
    NAVIGATE_TO_URL: 'NAVIGATE_TO_URL',
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    HIGHLIGHT: 'HIGHLIGHT',
    DEFAULT: 'DEFAULT'
  },

  /**
   * Enum constants to use as values for ScreenAnnotation field `clickAction`.
   */
  ScreenAnnotationClickAction: {
    TO_NEXT_STEP: 'TO_NEXT_STEP',
    TO_URL: 'TO_URL'
  }
};
var _default = scenarioo;
exports["default"] = _default;