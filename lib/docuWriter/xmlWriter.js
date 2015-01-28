'use strict';

var
  fs = require('fs'),
  _ = require('lodash'),
  path = require('path'),
  Q = require('q'),
  mkdirp = require('mkdirp'),
  xml2js = require('xml2js');

function serializeDates(data) {
  _.forEach(data, function (propertyValue, propertyName) {
    if (_.isDate(propertyValue)) {
      data[propertyName] = propertyValue.toISOString();
    }
  });
  return data;
}

function serialize(rootElement, data) {
  // clone incoming data, since we change some properties!
  var dataClone = _.cloneDeep(data);
  dataClone = serializeDates(dataClone);

  var builder = new xml2js.Builder({
    rootName: rootElement
  });

  return builder.buildObject(dataClone);
}

/**
 *
 * @param rootElement  The root element of the xml
 * @param data The data to serialize
 * @param targetFilePath
 * @returns {Promise} Resolves to the written filePath
 */
function writeXmlFile(rootElement, data, targetFilePath) {

  var xml = serialize(rootElement, data);

  var deferred = Q.defer();
  // generates all directories along the path
  Q.nfcall(mkdirp, path.dirname(path.resolve(targetFilePath)))
    .then(function () {
      fs.writeFile(targetFilePath, xml, 'UTF-8', function (err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(targetFilePath);
        }
      });
    }, deferred.reject);

  return deferred.promise;
}

var XmlWriter = {
  writeXmlFile: writeXmlFile
};

module.exports = XmlWriter;
