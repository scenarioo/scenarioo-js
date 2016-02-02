var
  fs = require('fs'),
  _ = require('lodash'),
  path = require('path'),
  Q = require('q'),
  mkdirp = require('mkdirp'),
  js2xmlparser = require('js2xmlparser');


/**
 * resolves the given path (to absolute),
 * generates all directories along the path
 * @param filePath path to a file
 */
function createDirsForFilePath(filePath) {
  mkdirp.sync(path.dirname(path.resolve(filePath)));
}

function serialize(rootElement, data) {
  // clone incoming data, since we change some properties!
  var dataClone = _.cloneDeep(data);

  // see https://github.com/michaelkourlas/node-js2xmlparser
  return js2xmlparser(rootElement, dataClone, {

    convertMap: {
      // automatically convert all dates to ISOString representation
      '[object Date]': function (date) {
        return date.toISOString();
      }
    },

    // we want the array property "labels" to be represented as <labels><label>....</label></labels>
    arrayMap: {
      labels: 'label'
    }
  });
}

function writeXmlFile(rootElement, data, targetFilePath) {

  var xml = serialize(rootElement, data);

  createDirsForFilePath(targetFilePath);

  var deferred = Q.defer();
  fs.writeFile(targetFilePath, xml, 'UTF-8', function (err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(targetFilePath);
    }
  });
  return deferred.promise;
}


module.exports = {
  writeXmlFile: writeXmlFile
};
