'use strict';

var util = require('../lib/util.js');

exports['util'] = {
    setUp: function (done) {
        // setup here
        done();
    },
    'test isDefined: undefined': function (test) {
        test.expect(1);
        test.ok(!util.isDefined(undefined));
        test.done();
    },
    'test isDefined: some string': function (test) {
        test.expect(1);
        test.ok(util.isDefined("abc"));
        test.done();
    },
    'test isDefined: null': function (test) {
        test.expect(1);
        test.ok(util.isDefined(null));
        test.done();
    },
    'test leadingZeros: int': function (test) {
        test.expect(1);
        test.equal(util.leadingZeros(1), "001");
        test.done();
    },
    'test leadingZeros: string': function (test) {
        test.expect(1);
        test.equal(util.leadingZeros("1"), "001");
        test.done();
    },
    'test leadingZeros: two digits': function (test) {
        test.expect(1);
        test.equal(util.leadingZeros("12"), "012");
        test.done();
    },
    'test leadingZeros: three digits': function (test) {
        test.expect(1);
        test.equal(util.leadingZeros("123"), "123");
        test.done();
    }
};
