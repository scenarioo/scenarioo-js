import fs from 'fs';
import assert from 'assert';
import isArray from 'lodash/isArray';
import Q from 'q';

function assertXmlContent(filePath, expectedContents) {
  return Q.nfcall(fs.readFile, filePath, 'utf-8')
    .then(xmlContent => {

      // Replace tabs in the beginning
      xmlContent = xmlContent.replace(/^[ \t]*/gm, '');
      // Replace all newlines and tabs
      xmlContent = xmlContent.replace(/(?:\r\n|\r|\n|\t)/g, '');

      if (!isArray(expectedContents)) {
        expectedContents = [expectedContents];
      }

      expectedContents.forEach(expectedContent => {
        assert(xmlContent.indexOf(expectedContent) > -1, 'Given xml is expected to contain "' + expectedContent + '"\n' + xmlContent);
      });
    });
}

function assertFileExists(filePath) {
  return Q.nfcall(fs.stat, filePath);
}

export default {
  assertXmlContent: assertXmlContent,
  assertFileExists: assertFileExists
};
