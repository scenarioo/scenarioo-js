import assert from 'assert';
import utils from '../../../src/docuWriter/utils';

describe('utils', () => {

  describe('#leadingZeros()', () => {

    it('should append two zeros (int)', () => {
      const result = utils.leadingZeros(1);
      assert.equal(result, '001');
    });

    it('should append two zeros', () => {
      const result = utils.leadingZeros('1');
      assert.equal(result, '001');
    });

    it('should append one zeros', () => {
      const result = utils.leadingZeros('12');
      assert.equal(result, '012');
    });

    it('should append no zero', () => {
      const result = utils.leadingZeros('123');
      assert.equal(result, '123');
    });

  });

  describe('#encodeFileName()', () => {

    it('should correctly replace spaces in input', () => {
      const input = 'This is my branch name';
      const result = utils.encodeFileName(input);
      assert.equal(result, 'This+is+my+branch+name');
    });

    it('should correctly replace specialChars', () => {
      const input = '~ \' ! ( )';
      const result = utils.encodeFileName(input);
      assert.equal(result, '%7E+%27+%21+%28+%29');
    });

  });
});
