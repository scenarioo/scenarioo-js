'use strict';

var
  assert = require('assert'),
  identifierSanitizer = require('../../../lib/docuWriter/identifierSanitizer');

describe('identifierSanitizer', function () {

  describe('#sanitize()', function () {

    it('should replace forward slashes', function () {
      var input = 'This is a unsafe identifier /with/a/path';
      var result = identifierSanitizer.sanitize(input);

      assert.equal(result, 'This is a unsafe identifier _with_a_path');
    });

    it('should replace backward slashes', function () {
      var input = 'This is a unsafe identifier C:\\stupid\\backslashes\\';
      var result = identifierSanitizer.sanitize(input);

      assert.equal(result, 'This is a unsafe identifier C:_stupid_backslashes_');
    });

    it('should handle undefined and null input', function () {
      var input;
      var result = identifierSanitizer.sanitize(input);
      assert(!result);

      input = null;
      result = identifierSanitizer.sanitize(input);
      assert(!result);
    });

  });

});
