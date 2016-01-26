'use strict';


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
 * @param inputString
 */
function encodeFileName(inputString) {
  var encodedString = encodeURIComponent(inputString);
  // scenarioo java api uses url encoding where slashes are plus signs
  encodedString = encodedString.replace(/%20/g, '+');
  return encodedString;
}

var util = {
  leadingZeros: leadingZeros,
  encodeFileName: encodeFileName
};

module.exports = util;
