/* scenarioo-js
 * Copyright (C) 2014, scenarioo.org Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var
  contextFactory = require('./contextFactory'),
  docuWriter = require('./docuWriter/docuWriter');

/**
 * @namespace scenarioo
 */
var scenariooJs = {

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
  reporter: require('./reporters/jasmine'),

  /**
   * will return the context for the current useCase.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getUseCaseContext
   * @returns {Context}
   */
  getUseCaseContext: function () {
    return contextFactory('useCase');
  },

  /**
   * will return the context for the current scenario.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getScenarioContext
   * @returns {Context}
   */
  getScenarioContext: function () {
    return contextFactory('scenario');
  },

  /**
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @func scenarioo#saveStep
   * @param {string} stepName
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels]
   * @param {object} [additionalProperties.details]
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   */
  saveStep: docuWriter.saveStep.bind(docuWriter)

};

module.exports = scenariooJs;
