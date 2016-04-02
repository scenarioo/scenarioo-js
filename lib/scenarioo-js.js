'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _contextFactory = require('./contextFactory');

var _contextFactory2 = _interopRequireDefault(_contextFactory);

var _docuWriter = require('./docuWriter/docuWriter');

var _docuWriter2 = _interopRequireDefault(_docuWriter);

var _jasmine = require('./reporters/jasmine');

var _jasmine2 = _interopRequireDefault(_jasmine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @namespace scenarioo
 */
var scenarioo = {

  // TODO: in the future, when we support different reporters for different testing-frameworks, the user would want to configure which reporter to use.

  /**
   * Instantiates the scenarioo reporter (currently jasmine) that can be registered with the jasmine env `jasmine.getEnv().addReporter(scenarioo.reporter(....));`
   * Usually this is invoked in your protractor config file.
   *
   * @func scenarioo#reporter
   * @param {object} options
   * @param {string} options.targetDirectory - The path to the target directory
   * @param {string} options.branchName
   * @param {string} options.branchDescription
   * @param {string} options.buildName
   * @param {string} options.revision
   * @param {function} [options.pageNameExtractor] - A custom function to extract the pageName from the url. Scenarioo will pass in a node.js url object.
   *
   */
  reporter: _jasmine2.default,

  /**
   * will return the context for the current useCase.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getUseCaseContext
   * @returns {context}
   */
  getUseCaseContext: function getUseCaseContext() {
    return (0, _contextFactory2.default)('useCase');
  },

  /**
   * will return the context for the current scenario.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getScenarioContext
   * @returns {context}
   */
  getScenarioContext: function getScenarioContext() {
    return (0, _contextFactory2.default)('scenario');
  },

  /**
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @func scenarioo#saveStep
   * @param {string} [stepName]
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels]
   * @param {object[]} [additionalProperties.screenAnnotations]
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   */
  saveStep: function saveStep() {
    // make sure that "scenarioo.saveStep()" gets added to the protractor controlFlow
    // this ensures that the save operation is not invoked immediately, but in-sync with the flow.
    // We do this wrapping here in order to keep docuWriter simple (not another dependency to protractor)
    var stepArguments = arguments;
    browser.controlFlow().execute(function () {
      _docuWriter2.default.saveStep.apply(_docuWriter2.default, stepArguments);
    });
  }

};

exports.default = scenarioo;