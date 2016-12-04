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

  global.by = {
    css: function(locator) {
      return {byCss: locator};
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
      deferred.resolve('dummyImageData');
      return deferred.promise;
    },
    findElement: function () {
      var element = {
        getText: function() {
          var deferred = Q.defer();
          deferred.resolve('dummy visible text');
          return deferred.promise;
        }
      };
      return element;
    }
  };

}

export default {
  registerMockGlobals: registerMockGlobals
};
