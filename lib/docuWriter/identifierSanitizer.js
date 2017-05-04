'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeForId = sanitizeForId;
exports.sanitizeForName = sanitizeForName;
exports.sanitizeLabels = sanitizeLabels;

var _diacritics = require('diacritics');

var _diacritics2 = _interopRequireDefault(_diacritics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Directories and ids that are used as url parameters or file/folder names can only contain a certain
 * set of characters. This methods sanitizes an input string for use in file paths and urls.
 * https://github.com/scenarioo/scenarioo-format/blob/master/format.md#identifier-sring
 *
 * @ignore
 * @param inputString
 */
function sanitizeForId(inputString) {
  if (!inputString) {
    return inputString;
  }

  // remove all diacritics. E.g. ä,å -> a
  var removedDiacritics = _diacritics2.default.remove(inputString);
  return removeUnallowedCharacters(removedDiacritics, /[^A-Za-z_0-9\-]/g);
}

/**
 * E.g. urls or paths sanitized for use in display names
 * @param inputString
 */
function sanitizeForName(inputString) {
  if (!inputString) {
    return inputString;
  }

  // remove all diacritics. E.g. ä,å -> a
  var removedDiacritics = _diacritics2.default.remove(inputString);
  return removeUnallowedCharacters(removedDiacritics, undefined);
}

/**
 * Same as #sanitizeForId but allows spaces
 *
 * @ignore
 * @param labels list of strings (labels)
 */
function sanitizeLabels(labels) {
  if (!labels) {
    return [];
  }

  return labels.map(function (label) {
    // remove all diacritics. E.g. ä,å -> a
    var removedDiacritics = _diacritics2.default.remove(label);
    return removeUnallowedCharacters(removedDiacritics, /[^A-Za-z_0-9\- ]/g);
  });
}

function removeUnallowedCharacters(inputString, unallowedCharactersRegex) {
  // replace slashes / and \ with underlines
  var sanitizedString = inputString.replace(/[/\\]/g, '_');

  // replace all left over characters that are not allowed with dashes
  return sanitizedString.replace(unallowedCharactersRegex, '-');
}

exports.default = { sanitizeForId: sanitizeForId, sanitizeLabels: sanitizeLabels };