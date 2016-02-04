var _ = require('lodash');

/**
 * replaces forward and backward slashes with underscores
 *
 * @ignore
 * @param identifier
 */
function sanitize(identifier) {
  if (_.isUndefined(identifier) || identifier === null) {
    return undefined;
  }

  return identifier.replace(/[\/|\\]/g, '_');
}

module.exports = {
  sanitize: sanitize
};
