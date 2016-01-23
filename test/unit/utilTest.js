'use strict';

var
    assert = require('assert'),
    util = require('../../lib/util.js');

describe('util', function () {

    describe('#isDefined()', function () {

        it('should return true for a string', function () {
            var result = util.isDefined('one two three');
            assert.equal(result, true);
        });

        it('should return true for an object', function () {
            var result = util.isDefined({'my': 'attribute'});
            assert.equal(result, true);
        });

        it('should return true for null', function () {
            var result = util.isDefined(null);
            assert.equal(result, true);
        });

        it('should return false for undefined (inline)', function () {
            var result = util.isDefined(undefined);
            assert.equal(result, false);
        });

        it('should return false for undefined', function () {
            var input;
            var result = util.isDefined(input);
            assert.equal(result, false);
        });
    });

    describe('#leadingZeros()', function () {

        it('should append two zeros (int)', function () {
            var result = util.leadingZeros(1);
            assert.equal(result, '001');
        });

        it('should append two zeros', function () {
            var result = util.leadingZeros('1');
            assert.equal(result, '001');
        });

        it('should append one zeros', function () {
            var result = util.leadingZeros('12');
            assert.equal(result, '012');
        });

        it('should append no zero', function () {
            var result = util.leadingZeros('123');
            assert.equal(result, '123');
        });

    });

    describe('#encodeFileName()', function () {

        it('should correctly replace spaces in input', function () {
            var input = 'This is my branch name';
            var result = util.encodeFileName(input);
            assert.equal(result, 'This+is+my+branch+name');
        });
    });
});
