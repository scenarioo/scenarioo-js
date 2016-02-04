import assert from 'assert';
import pageNameExtractor from '../../../src/docuWriter/pageNameExtractor';

describe('pageNameExtractor', () => {

  describe('#getPageNameFromUrl', () => {

    describe('default extraction', () => {

      beforeEach(() => {
        // do not use a custom extraction function.
        pageNameExtractor.registerCustomExtractionFunction(undefined);
      });

      it('should return default page name from simple Url', () => {
        let pageName;

        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.html');
        assert.equal(pageName, 'index.html');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/home');
        assert.equal(pageName, 'home');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/profile/details');
        assert.equal(pageName, 'profile/details');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/#/profile/details');
        assert.equal(pageName, '#/profile/details');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/home/#/profile/details');
        assert.equal(pageName, 'home/#/profile/details');
      });

      it('should return default page name from url with query params', () => {
        let pageName;

        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.php?action=some');
        assert.equal(pageName, 'index.php');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/#index.php?action=some');
        assert.equal(pageName, '#index.php');
        pageName = pageNameExtractor.getPageNameFromUrl('http://localhost:9000/#/step/Donate/find_donate_page/startSearch.jsp/0/0?branch=wikipedia-docu-example&build=2014-02-21');
        assert.equal(pageName, '#/step/Donate/find_donate_page/startSearch.jsp/0/0');
      });

      it('should return whole input if invalid url', () => {
        const pageName = pageNameExtractor.getPageNameFromUrl('this-.is a malformed url/with\\no sense');
        assert.equal(pageName, 'this-.is a malformed url/with\\no sense');
      });

    });

    describe('user custom extraction', () => {

      let customFunctionArguments;

      function customExtractionFunction(url) {
        customFunctionArguments.push(Array.prototype.splice.call(arguments, 0));

        return url;
      }

      beforeEach(() => {
        customFunctionArguments = [];
        pageNameExtractor.registerCustomExtractionFunction(customExtractionFunction);
      });

      it('should invoke custom function with parsed url object', () => {
        pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.php?action=some');
        assert.equal(customFunctionArguments.length, 1);
        assert.equal(customFunctionArguments[0][0].pathname, '/index.php');
        assert.equal(customFunctionArguments[0][0].search, '?action=some');
      });


    });

  });

});
