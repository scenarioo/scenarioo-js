import assert from 'assert';
import fs from 'fs';
import xmlWriter from '../../../src/docuWriter/xmlWriter';

describe('xmlWriter: simpleFile', function () {

  function doSave(dummyObjectToWrite) {
    return xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');
  }

  it('should serialize simple object', function (done) {

    var dummyObjectToWrite = {
      name: 'sergio',
      lastName: 'trentini'
    };

    doSave(dummyObjectToWrite).then(function () {
      done();
    });
  });

  it('should serialize object with labels array', function (done) {

    var dummyObjectToWrite = {
      labels: ['one', 'two', 'three']
    };

    doSave(dummyObjectToWrite).then(function (filePath) {

      fs.readFile(filePath, 'utf-8', (err, fileContent) => {
        if (err) {
          return done(err);
        }
        assert(fileContent.indexOf('<labels>') > -1);
        assert(fileContent.indexOf('<label>') > -1);
        done();
      });
    });
  });

  it('should serialize object with Date  ', function (done) {

    var dummyObjectToWrite = {
      date: new Date(0)
    };

    doSave(dummyObjectToWrite).then(function (filePath) {

      fs.readFile(filePath, 'utf-8', (err, fileContent) => {
        if (err) {
          return done(err);
        }
        assert(fileContent.indexOf('<date>1970-01-01T00:00:00') > -1);
        done();
      });
    });
  });

});
