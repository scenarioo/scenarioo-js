'use strict';

var xmlWriter = require('../../lib/xmlWriter.js');

describe('xmlWriter: simpleFile', function () {

    it('should serialize simple object', function () {

        var dummyObjectToWrite = {
            name: 'sergio',
            lastName: 'trentini'
        };

        var result = xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');

        expect(result).toBe(true);
    });


});