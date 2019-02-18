"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPageNameFromUrl = getPageNameFromUrl;
exports.registerCustomExtractionFunction = registerCustomExtractionFunction;
exports.default = void 0;

var _url = _interopRequireDefault(require("url"));

var _isNull = _interopRequireDefault(require("lodash/isNull"));

var _isFunction = _interopRequireDefault(require("lodash/isFunction"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  return !(0, _isNull.default)(urlObject.hostname) && !(0, _isNull.default)(urlObject.protocol);
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
  var urlObject = _url.default.parse(urlString);

  if ((0, _isFunction.default)(customExtractionFunction)) {
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

var _default = {
  getPageNameFromUrl: getPageNameFromUrl,
  registerCustomExtractionFunction: registerCustomExtractionFunction
};
exports.default = _default;