'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _scenariooStore = require('./scenariooStore');

var _scenariooStore2 = _interopRequireDefault(_scenariooStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Since useCase and scenario both can have additional properties like "description" and "labels",
 * we can reuse the same code for setting these properties.
 *
 * @ignore
 * @param {string} objectName  either "scenario" or "useCase"
 * @returns {{setDescription: setDescription, addLabels: addLabels}}
 */
function contextFactory(objectName) {

  objectName = capitalizeFirstLetter(objectName);
  var updateContextObject = _scenariooStore2.default['updateCurrent' + objectName];
  var getContextObject = _scenariooStore2.default['getCurrent' + objectName];

  /**
   * @namespace context
   */
  return {
    setDescription: setDescription,
    addLabels: addLabels,
    getCurrent: getCurrent
  };

  /**
   * @func context#setDescription
   * @param {string} description
   */
  function setDescription(description) {
    updateContextObject({ description: description });
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
    if (!(0, _isArray2.default)(labels)) {
      mergedLabels.push(labels);
    } else {
      mergedLabels = mergedLabels.concat(labels);
    }

    assertLabelFormat(mergedLabels);

    updateContextObject({
      labels: mergedLabels
    });
  }

  function getCurrent() {
    return getContextObject();
  }
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

exports.default = contextFactory;