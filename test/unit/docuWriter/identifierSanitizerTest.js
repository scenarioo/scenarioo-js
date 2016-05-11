import assert from 'assert';
import identifierSanitizer from '../../../src/docuWriter/identifierSanitizer';

describe('identifierSanitizer', () => {

  describe('#sanitizeForId()', () => {

    it('should replace forward slashes', () => {
      const input = '/with/a/path';
      const result = identifierSanitizer.sanitizeForId(input);

      assert.equal(result, '_with_a_path');
    });

    it('should replace backward slashes', () => {
      const input = 'C:\\stupid\\backslashes\\';
      const result = identifierSanitizer.sanitizeForId(input);

      assert.equal(result, 'C-_stupid_backslashes_');
    });

    it('should handle undefined and null input', () => {
      let input;
      let result = identifierSanitizer.sanitizeForId(input);
      assert(!result);

      input = null;
      result = identifierSanitizer.sanitizeForId(input);
      assert(!result);
    });

    it('should correctly replace spaces with dashes', () => {
      const input = 'This is my branch name';
      const result = identifierSanitizer.sanitizeForId(input);
      assert.equal(result, 'This-is-my-branch-name');
    });

    it('should correctly sanitize unicode characters', () => {
      const input = 'Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ';
      const result = identifierSanitizer.sanitizeForId(input);
      assert.equal(result, 'Internationalizati0n');
    });

  });

  describe('#sanitizeLabels', () => {

    it('allows the use of spaces', () => {
      const inputLabels = ['My new label'];
      const sanitizedLabels = identifierSanitizer.sanitizeLabels(inputLabels);
      assert.deepEqual(sanitizedLabels, ['My new label']);
    });

    it('should correctly sanitize multiple labels', () => {
      const inputLabels = ['label!1', 'label~2'];
      const sanitizedLabels = identifierSanitizer.sanitizeLabels(inputLabels);
      assert.deepEqual(sanitizedLabels, ['label-1', 'label-2']);
    });

    it('should correctly sanitize unicode characters', () => {
      const inputLabels = ['Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ'];
      const sanitizedLabels = identifierSanitizer.sanitizeLabels(inputLabels);
      assert.deepEqual(sanitizedLabels, ['Internationalizati0n']);
    });
  });

});
