"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.sanitize = sanitize;

var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * replaces forward and backward slashes with underscores
 *
 * @ignore
 * @param identifier
 */
function sanitize(identifier) {
  if ((0, _isUndefined["default"])(identifier) || identifier === null) {
    return undefined;
  }

  return identifier.replace(/[/|\\]/g, '_');
}

var _default = {
  sanitize: sanitize
};
exports["default"] = _default;