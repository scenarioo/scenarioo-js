'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitize = sanitize;

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * replaces forward and backward slashes with underscores
 *
 * @ignore
 * @param identifier
 */
function sanitize(identifier) {
  if ((0, _isUndefined2.default)(identifier) || identifier === null) {
    return undefined;
  }

  return identifier.replace(/[\/|\\]/g, '_');
}

exports.default = { sanitize: sanitize };