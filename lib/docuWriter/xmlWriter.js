'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeXmlFile = writeXmlFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _js2xmlparser = require('js2xmlparser');

var _js2xmlparser2 = _interopRequireDefault(_js2xmlparser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  return _q2.default.nfcall(_fs2.default.writeFile, targetFilePath, xml, 'UTF-8').then(function () {
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
  _mkdirp2.default.sync(_path2.default.dirname(_path2.default.resolve(filePath)));
}

function serialize(rootElement, data) {
  // clone incoming data, since we change some properties!
  var dataClone = (0, _cloneDeep2.default)(data);

  // see https://github.com/michaelkourlas/node-js2xmlparser
  return (0, _js2xmlparser2.default)(rootElement, dataClone, {

    convertMap: {
      // automatically convert all dates to ISOString representation
      '[object Date]': function objectDate(date) {
        return date.toISOString();
      }
    },

    arrayMap: {
      // we want the array property "labels" to be represented as <labels><label>....</label></labels>
      labels: 'label',
      // we want the array property "screenAnnotations" to be represented as <screenAnnotations><screenAnnotation>....</screenAnnotation></screenAnnotations>
      screenAnnotations: 'screenAnnotation'
    }
  });
}

exports.default = { writeXmlFile: writeXmlFile };