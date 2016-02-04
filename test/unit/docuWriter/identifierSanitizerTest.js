import assert from 'assert';
import identifierSanitizer from '../../../src/docuWriter/identifierSanitizer';

describe('identifierSanitizer', () => {

  describe('#sanitize()', () => {

    it('should replace forward slashes', () => {
      const input = 'This is a unsafe identifier /with/a/path';
      const result = identifierSanitizer.sanitize(input);

      assert.equal(result, 'This is a unsafe identifier _with_a_path');
    });

    it('should replace backward slashes', () => {
      const input = 'This is a unsafe identifier C:\\stupid\\backslashes\\';
      const result = identifierSanitizer.sanitize(input);

      assert.equal(result, 'This is a unsafe identifier C:_stupid_backslashes_');
    });

    it('should handle undefined and null input', () => {
      let input;
      let result = identifierSanitizer.sanitize(input);
      assert(!result);

      input = null;
      result = identifierSanitizer.sanitize(input);
      assert(!result);
    });

  });

});
