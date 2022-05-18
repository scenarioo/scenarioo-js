"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.writeXmlFile = writeXmlFile;

var _fs = _interopRequireDefault(require("fs"));

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _path = _interopRequireDefault(require("path"));

var _q = _interopRequireDefault(require("q"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _js2xmlparser = require("js2xmlparser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * writes the given data object as xml file
 * @ignore
 * @param rootElement
 * @param data
 * @param targetFilePath
 * @returns {Promise} Returns a promise that resolves to the given targetFilePath
 */
function writeXmlFile(rootElement, data, targetFilePath) {
  var xml = serialize(rootElement, data);
  createDirsForFilePath(targetFilePath);
  return _q["default"].nfcall(_fs["default"].writeFile, targetFilePath, xml, 'UTF-8').then(function () {
    return targetFilePath;
  });
}
/**
 * resolves the given path (to absolute),
 * generates all directories along the path
 *
 * @ignore
 * @param filePath path to a file
 */


function createDirsForFilePath(filePath) {
  _mkdirp["default"].sync(_path["default"].dirname(_path["default"].resolve(filePath)));
}

function serialize(rootElement, data) {
  // clone incoming data, since we change some properties!
  var dataClone = (0, _cloneDeep["default"])(data); // see https://github.com/michaelkourlas/node-js2xmlparser

  return (0, _js2xmlparser.parse)(rootElement, dataClone, {
    typeHandlers: {
      // automatically convert all dates to ISOString representation
      '[object Date]': function objectDate(date) {
        return date.toISOString();
      }
    },
    wrapHandlers: {
      // we want the array property "labels" to be represented as <labels><label>....</label></labels>
      labels: function labels() {
        return 'label';
      },
      // we want the array property "screenAnnotations" to be represented as <screenAnnotations><screenAnnotation>....</screenAnnotation></screenAnnotations>
      screenAnnotations: function screenAnnotations() {
        return 'screenAnnotation';
      }
    }
  });
}

var _default = {
  writeXmlFile: writeXmlFile
};
exports["default"] = _default;