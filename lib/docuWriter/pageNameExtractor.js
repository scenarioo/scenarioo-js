'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPageNameFromUrl = getPageNameFromUrl;
exports.registerCustomExtractionFunction = registerCustomExtractionFunction;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _isNull = require('lodash/isNull');

var _isNull2 = _interopRequireDefault(_isNull);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var customExtractionFunction = undefined;

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
  return !(0, _isNull2.default)(urlObject.hostname) && !(0, _isNull2.default)(urlObject.protocol);
}

/**
 * Returns the pageName from the given Url String.
 * By default, this is the part of the url without the host (domain) and without query parameters.
 *
 * You can register a custom extraction function to be used.
 *
 * @ignore
 */
function getPageNameFromUrl(urlString) {
  var urlObject = _url2.default.parse(urlString);
  if ((0, _isFunction2.default)(customExtractionFunction)) {
    return customExtractionFunction(urlObject);
  } else if (!isValidUrlObject(urlObject)) {
    return urlString;
  } else {
    return buildDefaultPageName(urlObject);
  }
}

function registerCustomExtractionFunction(extractionFunction) {
  customExtractionFunction = extractionFunction;
}

exports.default = { getPageNameFromUrl: getPageNameFromUrl, registerCustomExtractionFunction: registerCustomExtractionFunction };