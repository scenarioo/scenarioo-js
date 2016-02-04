import assert from 'assert';
import utils from '../../../src/docuWriter/utils';

describe('utils', function () {

  describe('#leadingZeros()', function () {

    it('should append two zeros (int)', function () {
      var result = utils.leadingZeros(1);
      assert.equal(result, '001');
    });

    it('should append two zeros', function () {
      var result = utils.leadingZeros('1');
      assert.equal(result, '001');
    });

    it('should append one zeros', function () {
      var result = utils.leadingZeros('12');
      assert.equal(result, '012');
    });

    it('should append no zero', function () {
      var result = utils.leadingZeros('123');
      assert.equal(result, '123');
    });

  });

  describe('#encodeFileName()', function () {

    it('should correctly replace spaces in input', function () {
      var input = 'This is my branch name';
      var result = utils.encodeFileName(input);
      assert.equal(result, 'This+is+my+branch+name');
    });

    it('should correctly replace specialChars', function () {
      var input = '~ \' ! ( )';
      var result = utils.encodeFileName(input);
      assert.equal(result, '%7E+%27+%21+%28+%29');
    });

  });
});
