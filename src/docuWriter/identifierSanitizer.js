import isUndefined from 'lodash/isUndefined';

/**
 * replaces forward and backward slashes with underscores
 *
 * @ignore
 * @param identifier
 */
export function sanitize(identifier) {
  if (isUndefined(identifier) || identifier === null) {
    return undefined;
  }

  return identifier.replace(/[\/|\\]/g, '_');
}

export default {sanitize};
