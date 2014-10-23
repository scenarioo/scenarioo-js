'use strict';

// TODO: do correct URL encoding!
// scenarioo expects all filenames to be url encoded ( I guess...). will be displayed human friendly in scenarioo webapp, nevertheless
function getSafeForFileName(inputString) {
    inputString = inputString || '';
    return inputString.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function isDefined(value) {
    return typeof value !== 'undefined';
}

function leadingZeros(n) {
    return ('00' + n).slice(-3);
}

function sanitizeIdentifier(identifier) {
    if(!isDefined(identifier) || identifier === null || typeof identifier !== 'string') {
        return identifier;
    }

    return identifier.replace(/[\/\\]/g, '_');
}

var util = {
    getSafeForFileName: getSafeForFileName,
    isDefined: isDefined,
    leadingZeros: leadingZeros,
    sanitizeIdentifier: sanitizeIdentifier
};

module.exports = util;
