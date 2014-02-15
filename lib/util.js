'use strict';


// TODO: do correct URL encoding!
// scenarioo expects all filenames to be url encoded. will be displayed human friendly in scenarioo webapp, nevertheless
function getSafeForFileName(inputString) {
    inputString = inputString || "";
    return inputString.replace(/ /g, '_').replace(/\//, '_').replace(/:/, '');
}

function isDefined(value) {
    return typeof value !== 'undefined';
}

function leadingZeros(n) {
    return ("00" + n).slice(-3);
}

var util = {
    getSafeForFileName: getSafeForFileName,
    isDefined: isDefined,
    leadingZeros: leadingZeros
};

module.exports = util;
