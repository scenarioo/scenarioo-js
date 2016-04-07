import Q from 'q';

function registerMockGlobals() {

  global.jasmine = {
    Spec: {
      prototype: {
        /**
         * Jasmine reporter overwrites and calls this prototype method to hook into jasmine for getting expectation results
         *
         */
        addExpectationResult: function (/* passed, expectation*/) {
        }
      }
    }
  };


  global.browser = {
    getPageSource: function() {
      var outerHtmlDeferred = Q.defer();
      outerHtmlDeferred.resolve('<html></html>');
      return outerHtmlDeferred.promise;
    },
    getCurrentUrl: function () {
      var deferred = Q.defer();
      deferred.resolve('http://example.url.com/#/somepage');
      return deferred.promise;
    },
    takeScreenshot: function () {
      var deferred = Q.defer();
      deferred.resolve('dummyImageDate');
      return deferred.promise;
    }
  };

}

export default {
  registerMockGlobals: registerMockGlobals
};
