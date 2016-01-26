var
  url = require('url'),
  _ = require('lodash');

var customExtractionFunction;

function buildDefaultPageName(urlObject) {
  var pageName = urlObject.pathname.substring(1);

  if (urlObject.hash) {
    pageName += removeEveryhtingAfterQuestionMark(urlObject.hash);
  }
  return pageName;
}

function removeEveryhtingAfterQuestionMark(href) {
  var pos = href.indexOf('?');
  if (pos > -1) {
    return href.substring(0, pos);
  } else {
    return href;
  }
}

function isValidUrlObject(urlObject) {
  return !_.isNull(urlObject.hostname) && !_.isNull(urlObject.protocol);
}

/**
 * Returns the pageName from the given Url String.
 * By default, this is the part of the url without the host (domain) and without query parameters.
 *
 * You can register a custom extraction function to be used.
 */
function getPageNameFromUrl(urlString) {
  var urlObject = url.parse(urlString);
  if (_.isFunction(customExtractionFunction)) {
    return customExtractionFunction(urlObject);
  } else if (!isValidUrlObject(urlObject)) {
    return urlString;
  } else {
    return buildDefaultPageName(urlObject);
  }
}

function registerCustomExtractionFunction(_customExtractionFunction) {
  customExtractionFunction = _customExtractionFunction;
}

module.exports = {
  getPageNameFromUrl: getPageNameFromUrl,
  registerCustomExtractionFunction: registerCustomExtractionFunction
};
