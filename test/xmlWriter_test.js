'use strict';

var xmlWriter = require('../lib/xmlWriter.js');

exports['xmlWriter'] = {
    setUp: function (done) {
        // setup here
        done();
    },
    'test writing simple file': function (test) {
        test.expect(1);

        var dummyObjectToWrite = {
            name: 'sergio',
            lastName: 'trentini'
        };

        var result = xmlWriter.writeXmlFile('rootElement', dummyObjectToWrite, './test/out/testfile.xml');

        test.ok(result);
        test.done();
    }
};
