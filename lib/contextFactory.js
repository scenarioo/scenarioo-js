var
  _ = require('lodash'),
  store = require('./scenariooStore');

module.exports = contextFactory;

/**
 * Since useCase and scenario both can have additional properties like "description", "labels" and "details,
 * we can reuse the same code for setting these properties.
 *
 *
 * @param {string} objectName  either "scenario" or "useCase"
 * @returns {{setDescription: setDescription, addLabels: addLabels}}
 */
function contextFactory(objectName) {

  objectName = capitalizeFirstLetter(objectName);
  var updateContextObject = store['updateCurrent' + objectName];
  var getContextObject = store['getCurrent' + objectName];

  function setDescription(description) {
    updateContextObject({
      description: description
    });
  }

  /**
   *
   * @param {string | string[]} labels an array of strings or a single string
   */
  function addLabels(labels) {
    var currentContext = getContextObject();
    var mergedLabels = currentContext.labels || [];
    if (!_.isArray(labels)) {
      mergedLabels.push(labels);
    } else {
      mergedLabels = mergedLabels.concat(labels);
    }
    updateContextObject({
      labels: mergedLabels
    });
  }

  return {
    setDescription: setDescription,
    addLabels: addLabels
  };

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
