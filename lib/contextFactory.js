"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _isArray = _interopRequireDefault(require("lodash/isArray"));

var _scenariooStore = _interopRequireDefault(require("./scenariooStore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

  var updateContextObject = _scenariooStore["default"]["updateCurrent".concat(objectName)];

  var getContextObject = _scenariooStore["default"]["getCurrent".concat(objectName)];
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
    if (!_scenariooStore["default"].isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      _scenariooStore["default"].init({});
    }

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

    if (!_scenariooStore["default"].isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      _scenariooStore["default"].init({});
    }

    var currentContext = getContextObject();
    var mergedLabels = currentContext.labels || [];

    if (!(0, _isArray["default"])(labels)) {
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
    if (!_scenariooStore["default"].isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      _scenariooStore["default"].init({});
    }

    return getContextObject();
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
} // labels must match the following pattern.
// see https://github.com/scenarioo/scenarioo/wiki/Labels


var LABEL_PATTERN = /^[ a-zA-Z0-9_-]+$/;

function assertLabelFormat(labels) {
  labels.forEach(function (label) {
    if (!LABEL_PATTERN.test(label)) {
      throw new Error("Given label \"".concat(label, "\" does not adhere to format"));
    }
  });
}

var _default = contextFactory;
exports["default"] = _default;