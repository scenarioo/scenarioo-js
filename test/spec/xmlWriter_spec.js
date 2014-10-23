'use strict';

var xmlWriter = require('../../lib/xmlWriter.js');

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


});
