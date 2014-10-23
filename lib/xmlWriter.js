'use strict';

var
  fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  directory = require('./directory.js'),
  js2xmlparser = require('js2xmlparser');


/**
 * resolves the given path (to absolute),
 * generates all directories along the path
 * @param filePath path to a file
 */
function createDirsForFilePath(filePath) {
  directory.mkdirSync(path.dirname(path.resolve(filePath)));
}

function writeXmlFile(rootElement, data, targetFilePath) {

  createDirsForFilePath(targetFilePath);

  var deferred = Q.defer();
  fs.writeFile(targetFilePath, js2xmlparser(rootElement, data), 'UTF-8', function (err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(targetFilePath);
    }
  });
  return deferred.promise;
}

var XmlWriter = {
  writeXmlFile: writeXmlFile
};

module.exports = XmlWriter;
