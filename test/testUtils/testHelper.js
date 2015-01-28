'use strict';

var
  xml2js = require('xml2js'),
  Q = require('q'),
  fs = require('fs'),
  findit = require('findit');


function logDirectoryTree(rootDir) {

  var deferred = Q.defer();

  var find = findit(rootDir);

  find.on('file', function (file) {
    console.log('f ' + file);
  });

  find.on('directory', function (file) {
    console.log('d ' + file);
  });

  find.on('end', function () {
    deferred.resolve();
  });

  find.on('error', function () {
    deferred.reject();
  });

  return deferred.promise;
}

function assertXmlContent(filePath, content, done) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      done(err);
      return;
    }

    var parser = new xml2js.Parser();
    parser.parseString(data, function (err, result) {
      if (err) {
        done(err);
        return;
      }
      assert.deepEqual(result, content, 'Xml content must match expectation');

      done();
    });
  });
}

function assertFileExists(targetDir, filePath, done) {
  fs.exists(filePath, function (result) {
    if (result === false) {
      // file not found, list files in our test-out dir
      logDirectoryTree(targetDir)
        .then(function () {
          done(new Error('File ' + filePath + ' does not exist!'));
        });

    } else {
      done();
    }
  });
}

//   extend assert with a string contains check
var assert = require('assert');
assert.contain = function (input, query) {
  assert(input.indexOf(query) > -1, 'Expected "' + input + '" to contain "' + query + '"');
};

module.exports = {
  logDirectoryTree: logDirectoryTree,
  assertXmlContent: assertXmlContent,
  assertFileExists: assertFileExists
};
