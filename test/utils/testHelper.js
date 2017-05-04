import fs from 'fs';
import assert from 'assert';
import isArray from 'lodash/isArray';
import Q from 'q';

function assertXmlContent(filePath, expectedContents) {
  return Q.nfcall(fs.readFile, filePath, 'utf-8')
    .then(xmlContent => {

      xmlContent = xmlContent.replace(/(?:\r\n|\r|\n|\t)/g, '');

      if (!isArray(expectedContents)) {
        expectedContents = [expectedContents];
      }

      expectedContents.forEach(expectedContent => {
        assert(xmlContent.indexOf(expectedContent) > -1, 'Given xml is expected to contain "' + expectedContent + '"\n' + xmlContent);
      });
    });
}

const OPTIONAL_FIELDS = ['labels', 'id'];

function assertJsonContent(filePath, expectedObject) {
  return Q.nfcall(fs.readFile, filePath, 'utf-8')
    .then(jsonContent => {
      const readObject = JSON.parse(jsonContent);

      // copy the values of optional/generated fields
      for (let fieldName of OPTIONAL_FIELDS) {
        const val = expectedObject[fieldName];
        if ((val === undefined || val === []) && readObject[fieldName]) {
          expectedObject[fieldName] = readObject[fieldName];
        }
      }

      assert.deepEqual(readObject, expectedObject);
    });
}

function assertFileExists(filePath) {
  return Q.nfcall(fs.stat, filePath);
}

export default {
  assertXmlContent: assertXmlContent,
  assertJsonContent: assertJsonContent,
  assertFileExists: assertFileExists
};
