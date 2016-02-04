import Q from 'q';

function registerMockGlobals() {

  global.browser = {
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

  global.by = {
    css: function () {
    }
  };

  global.element = function () {
    return {
      getOuterHtml: function () {
        var outerHtmlDeferred = Q.defer();
        outerHtmlDeferred.resolve('<html></html>');
        return outerHtmlDeferred.promise;
      }
    };
  };
}

export default {
  registerMockGlobals: registerMockGlobals
};
