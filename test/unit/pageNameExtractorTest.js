'use strict';

var
  pageNameExtractor = require('../../lib/pageNameExtractor'),
  expect = require('expect.js');

describe('pageNameExtractor', function () {

  describe('#getPageNameFromUrl', function () {

    describe('default extraction', function () {

      beforeEach(function () {
        // do not use a custom extraction function.
        pageNameExtractor.registerCustomExtractionFunction(undefined);
      });

      it('should return default page name from simple Url', function () {
        var pageName;

        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.html');
        expect(pageName).to.be('index.html');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/home');
        expect(pageName).to.be('home');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/profile/details');
        expect(pageName).to.be('profile/details');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/#/profile/details');
        expect(pageName).to.be('#/profile/details');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/home/#/profile/details');
        expect(pageName).to.be('home/#/profile/details');
      });

      it('should return default page name from url with query params', function () {
        var pageName;

        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.php?action=some');
        expect(pageName).to.be('index.php');
        pageName = pageNameExtractor.getPageNameFromUrl('http://some-domain.com/#index.php?action=some');
        expect(pageName).to.be('#index.php');
        pageName = pageNameExtractor.getPageNameFromUrl('http://localhost:9000/#/step/Donate/find_donate_page/startSearch.jsp/0/0?branch=wikipedia-docu-example&build=2014-02-21');
        expect(pageName).to.be('#/step/Donate/find_donate_page/startSearch.jsp/0/0');
      });

      it('should return whole input if invalid url', function () {
        var pageName = pageNameExtractor.getPageNameFromUrl('this-.is a malformed url/with\\no sense');
        expect(pageName).to.be('this-.is a malformed url/with\\no sense');
      });

    });

    describe('user custom extraction', function () {

      var customFunctionArguments;

      function customExtractionFunction(url) {
        customFunctionArguments.push(Array.prototype.splice.call(arguments, 0));

        return url;
      }

      beforeEach(function () {
        customFunctionArguments = [];
        pageNameExtractor.registerCustomExtractionFunction(customExtractionFunction);
      });

      it('should invoke custom function with parsed url object', function () {
        pageNameExtractor.getPageNameFromUrl('http://some-domain.com/index.php?action=some');
        expect(customFunctionArguments.length).to.be(1);
        expect(customFunctionArguments[0][0].pathname).to.be('/index.php');
        expect(customFunctionArguments[0][0].search).to.be('?action=some');
      });


    });

  });

});
