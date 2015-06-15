'use strict';

var util = require('../../lib/util.js');
var expect = require('expect.js');

describe('util', function () {

  describe('#isDefined()', function () {

    it('should return true for a string', function () {
      var result = util.isDefined('one two three');
      expect(result).to.be(true);
    });

    it('should return true for an object', function () {
      var result = util.isDefined({'my': 'attribute'});
      expect(result).to.be(true);
    });

    it('should return true for null', function () {
      var result = util.isDefined(null);
      expect(result).to.be(true);
    });

    it('should return false for undefined (inline)', function () {
      var result = util.isDefined(undefined);
      expect(result).to.be(false);
    });

    it('should return false for undefined', function () {
      var input;
      var result = util.isDefined(input);
      expect(result).to.be(false);
    });
  });

  describe('#leadingZeros()', function () {

    it('should append two zeros (int)', function () {
      var result = util.leadingZeros(1);
      expect(result).to.be('001');
    });

    it('should append two zeros', function () {
      var result = util.leadingZeros('1');
      expect(result).to.be('001');
    });

    it('should append one zeros', function () {
      var result = util.leadingZeros('12');
      expect(result).to.be('012');
    });

    it('should append no zero', function () {
      var result = util.leadingZeros('123');
      expect(result).to.be('123');
    });

  });

  describe('#encodeFileName()', function () {

    it('should correctly replace spaces in input', function () {
      var input = 'This is my branch name';
      var result = util.encodeFileName(input);
      expect(result).to.be('This+is+my+branch+name');
    });
  });
});
