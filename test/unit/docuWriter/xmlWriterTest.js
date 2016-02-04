import assert from 'assert';
import fs from 'fs';
import xmlWriter from '../../../src/docuWriter/xmlWriter';

describe('xmlWriter: simpleFile', () => {

  function doSave(dummyObjectToWrite) {
    return xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');
  }

  it('should serialize simple object', () => {

    var dummyObjectToWrite = {
      name: 'sergio',
      lastName: 'trentini'
    };

    return doSave(dummyObjectToWrite);
  });

  it('should serialize object with labels array', done => {

    const dummyObjectToWrite = {
      labels: ['one', 'two', 'three']
    };

    doSave(dummyObjectToWrite).then(filePath => {

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

  it('should serialize object with Date  ', done => {

    const dummyObjectToWrite = {
      date: new Date(0)
    };

    doSave(dummyObjectToWrite).then(filePath => {

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
