'use strict';

var
  assert = require('assert'),
  xml2js = require('xml2js'),
  Q = require('q'),
  fs = require('fs');

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
      assert.deepEqual(result, content);

      done();
    });
  });
}

function assertFileExists(filePath) {
  return Q.nfcall(fs.stat, filePath);
}

module.exports = {
  assertXmlContent: assertXmlContent,
  assertFileExists: assertFileExists
};
