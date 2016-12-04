import url from 'url';
import isNull from 'lodash/isNull';
import isFunction from 'lodash/isFunction';

let customExtractionFunction;

function buildDefaultPageName(urlObject) {
  let pageName = urlObject.pathname.substring(1);

  if (urlObject.hash) {
    pageName += removeEveryhtingAfterQuestionMark(urlObject.hash);
  }
  return pageName;
}

function removeEveryhtingAfterQuestionMark(href) {
  const pos = href.indexOf('?');
  if (pos > -1) {
    return href.substring(0, pos);
  } else {
    return href;
  }
}

function isValidUrlObject(urlObject) {
  return !isNull(urlObject.hostname) && !isNull(urlObject.protocol);
}

/**
 * Returns the pageName from the given Url String.
 * By default, this is the part of the url without the host (domain) and without query parameters.
 *
 * You can register a custom extraction function to be used.
 *
 * @ignore
 */
export function getPageNameFromUrl(urlString) {
  const urlObject = url.parse(urlString);
  if (isFunction(customExtractionFunction)) {
    return customExtractionFunction(urlObject);
  } else if (!isValidUrlObject(urlObject)) {
    return urlString;
  } else {
    return buildDefaultPageName(urlObject);
  }
}

export function registerCustomExtractionFunction(extractionFunction) {
  customExtractionFunction = extractionFunction;
}

export default {getPageNameFromUrl, registerCustomExtractionFunction};
