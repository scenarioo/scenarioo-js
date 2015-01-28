'use strict';

var Q = require('q');

function getCurrentPageInformation() {
  var deferred = Q.defer();

  browser
    .getCurrentUrl()
    .then(function (currentUrl) {
      element(by.css('body')).getOuterHtml().then(function (pageHtmlSource) {
        deferred.resolve({url: currentUrl, source: pageHtmlSource});
      }, deferred.reject);

    }, deferred.reject);

  return deferred.promise;
}

function getScreenshot() {
  return browser.takeScreenshot();
}

module.exports = {
  getCurrentPageInformation: getCurrentPageInformation,
  getScreenshot: getScreenshot
};
