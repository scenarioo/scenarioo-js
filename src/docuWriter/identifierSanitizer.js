import diacritics from 'diacritics';

/**
 * Directories and ids that are used as url parameters or file/folder names can only contain a certain
 * set of characters. This methods sanitizes an input string for use in file paths and urls.
 * https://github.com/scenarioo/scenarioo-format/blob/master/format.md#identifier-sring
 *
 * @ignore
 * @param inputString
 */
export function sanitizeForId(inputString) {
  if (!inputString) {
    return inputString;
  }

  // remove all diacritics. E.g. ä,å -> a
  const removedDiacritics = diacritics.remove(inputString);
  return removeUnallowedCharacters(removedDiacritics, /[^A-Za-z_0-9\-]/g);
}

/**
 * Same as #sanitizeForId but allows spaces
 *
 * @ignore
 * @param labels list of strings (labels)
 */
export function sanitizeLabels(labels) {
  if (!labels) {
    return [];
  }

  return labels.map((label) => {
    // remove all diacritics. E.g. ä,å -> a
    const removedDiacritics = diacritics.remove(label);
    return removeUnallowedCharacters(removedDiacritics, /[^A-Za-z_0-9\- ]/g);
  });
}

function removeUnallowedCharacters(inputString, unallowedCharactersRegex) {
  // replace slashes / and \ with underlines
  var sanitizedString = inputString.replace(/[/\\]/g, '_');

  // replace all left over characters that are not allowed with dashes
  return sanitizedString.replace(unallowedCharactersRegex, '-');
}

export default {sanitizeForId, sanitizeLabels};
