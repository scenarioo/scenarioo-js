var
  assert = require('assert'),
  fs = require('fs'),
  xmlWriter = require('../../../lib/docuWriter/xmlWriter.js');

describe('xmlWriter: simpleFile', function () {

  it('should serialize simple object', function (done) {

    var dummyObjectToWrite = {
      name: 'sergio',
      lastName: 'trentini'
    };

    var promise = xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');

    promise.then(function () {
      done();
    });
  });

  it('should serialize object with labels array', function (done) {

    var dummyObjectToWrite = {
      labels: ['one', 'two', 'three']
    };

    var promise = xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');

    promise.then(function (filePath) {

      fs.readFile(filePath, 'utf-8', function (err, fileContent) {
        if (err) {
          return done(err);
        }
        assert(fileContent.indexOf('<labels>') > -1);
        assert(fileContent.indexOf('<label>') > -1);
        done();
      });
    });
  });

});
