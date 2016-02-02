'use strict';

var
  _ = require('lodash'),
  assert = require('assert'),
  Q = require('q'),
  fs = require('fs');

function assertXmlContent(filePath, expectedContents) {
  return Q.nfcall(fs.readFile, filePath, 'utf-8')
    .then(function (xmlContent) {

      xmlContent = xmlContent.replace(/(?:\r\n|\r|\n|\t)/g, '');

      if (!_.isArray(expectedContents)) {
        expectedContents = [expectedContents];
      }

      expectedContents.forEach(function (expectedContent) {
        assert(xmlContent.indexOf(expectedContent) > -1, 'Given xml is expected to contain "' + expectedContent + '"\n' + xmlContent);
      })
    });
}

function assertFileExists(filePath) {
  return Q.nfcall(fs.stat, filePath);
}

module.exports = {
  assertXmlContent: assertXmlContent,
  assertFileExists: assertFileExists
};
