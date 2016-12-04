'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.leadingZeros = leadingZeros;
exports.encodeFileName = encodeFileName;
/**
 * prepends leading zeros to the given string, so that
 * the resulting string will be 3 characters long
 *
 * @ignore
 * @param n
 * @returns {string}
 */
function leadingZeros(n) {
  return ('00' + n).slice(-3);
}

/**
 * The following directories in the generated folder/file structure have to be URL encoded:
 *  - branch directory
 *  - build directory
 *  - use case directory
 *  - scenario directory
 *
 * @ignore
 * @param inputString
 */
function encodeFileName(inputString) {
  var encodedString = encodeURIComponent(inputString);

  // scenarioo java api uses java.net.URLEncoder which encodes strings differently
  // See http://stackoverflow.com/a/607403
  // and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

  // scenarioo java api uses url encoding where slashes are plus signs
  encodedString = encodedString.replace(/%20/g, '+');

  // ECMAScripts' "encodeURIComponent" does not encode parentheses, java.net.URLEncoder does!
  encodedString = encodedString.replace(/\)/g, '%29');
  encodedString = encodedString.replace(/\(/g, '%28');

  // ECMAScripts' "encodeURIComponent" does not encode the following chars, java.net.URLEncoder does!
  encodedString = encodedString.replace(/~/g, '%7E');
  encodedString = encodedString.replace(/'/g, '%27');
  encodedString = encodedString.replace(/!/g, '%21');

  return encodedString;
}

exports.default = { encodeFileName: encodeFileName, leadingZeros: leadingZeros };