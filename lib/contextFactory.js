var
  _ = require('lodash'),
  store = require('./scenariooStore');

module.exports = contextFactory;

/**
 * Since useCase and scenario both can have additional properties like "description", "labels" and "details,
 * we can reuse the same code for setting these properties.
 *
 * @ignore
 * @param {string} objectName  either "scenario" or "useCase"
 * @returns {{setDescription: setDescription, addLabels: addLabels}}
 */
function contextFactory(objectName) {

  objectName = capitalizeFirstLetter(objectName);
  var updateContextObject = store['updateCurrent' + objectName];
  var getContextObject = store['getCurrent' + objectName];

  /**
   * @func context#setDescription
   * @param {string} description
   */
  function setDescription(description) {
    updateContextObject({
      description: description
    });
  }

  /**
   *
   * @func context#addLabels
   * @param {string | string[]} labels an array of strings or a single string
   */
  function addLabels(labels) {
    if (!labels) {
      return;
    }

    var currentContext = getContextObject();
    var mergedLabels = currentContext.labels || [];
    if (!_.isArray(labels)) {
      mergedLabels.push(labels);
    } else {
      mergedLabels = mergedLabels.concat(labels);
    }

    assertLabelFormat(mergedLabels);

    updateContextObject({
      labels: mergedLabels
    });
  }

  /**
   * @namespace context
   */
  return {
    setDescription: setDescription,
    addLabels: addLabels
  };

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// labels must match the following pattern.
// see https://github.com/scenarioo/scenarioo/wiki/Labels
var LABEL_PATTERN = /^[ a-zA-Z0-9_-]+$/;
function assertLabelFormat(labels) {
  labels.forEach(function (label) {
    if (!LABEL_PATTERN.test(label)) {
      throw new Error('Given label "' + label + '" does not adhere to format');
    }
  });
}
