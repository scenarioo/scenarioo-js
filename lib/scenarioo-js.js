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

var scenariooJs = {

  // in the future, when we support different reporters for different testing-frameworks,
  // the user would want to configure which reporter to use.
  reporter: require('./reporters/jasmine'),

  /**
   * will return the context for the current useCase.
   * Allows you to set additional information like "description" and "labels"
   * @returns {{setDescription, addLabels}|*}
   */
  getUseCaseContext: function () {
    return contextFactory('useCase');
  },

  /**
   * will return the context for the current scenario.
   * Allows you to set additional information like "description" and "labels"
   * @returns {{setDescription, addLabels}|*}
   */
  getScenarioContext: function () {
    return contextFactory('scenario');
  },

  /**
   * Expose docuWriter's "saveStep" function.
   *
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @param {string} stepName
   * @param {object} details
   */
  saveStep: docuWriter.saveStep.bind(docuWriter)

};

module.exports = scenariooJs;
