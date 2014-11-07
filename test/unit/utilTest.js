'use strict';

var util = require('../../lib/util.js');
var expect = require('expect.js');

describe('util: isDefined', function () {

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

describe('util: leadingZeros', function () {

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

describe('util: safeForFilename', function () {

  it('should not escape numbers', function () {
    var result = util.getSafeForFileName('123');
    expect(result).to.be('123');
  });

  it('should not escape alphabetic chars', function () {
    var result = util.getSafeForFileName('abc');
    expect(result).to.be('abc');
  });

  it('should escape blanks', function () {
    var result = util.getSafeForFileName('a b c');
    expect(result).to.be('a_b_c');
  });

  it('should escape blanks (alphanumeric)', function () {
    var result = util.getSafeForFileName('a1 b2 c3');
    expect(result).to.be('a1_b2_c3');
  });

  it('should escape special chars', function () {
    var result = util.getSafeForFileName('a+a%,a some');
    expect(result).to.be('a_a__a_some');
  });

});

describe('util: sanitizeIdentifier', function () {

  it('should return the original value if it is not a string', function () {
    expect(util.sanitizeIdentifier(123)).to.be(123);
    expect(util.sanitizeIdentifier(null)).to.be(null);
    expect(util.sanitizeIdentifier(undefined)).to.be(undefined);
  });

  it('should return the original value if the string input does not contain forbidden characters', function () {
    var validString = 'abc123DEF_- .:';
    expect(util.sanitizeIdentifier(validString)).to.be(validString);
  });

  it('should replace slashes', function () {
    expect(util.sanitizeIdentifier('/some/string')).to.be('_some_string');
  });

  it('should replace backslashes', function () {
    expect(util.sanitizeIdentifier('\\some\\string')).to.be('_some_string');
  });

});
