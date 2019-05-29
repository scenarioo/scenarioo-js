import fs from 'fs';
import cloneDeep from 'lodash/cloneDeep';
import path from 'path';
import Q from 'q';
import mkdirp from 'mkdirp';
import {parse as js2xmlparser} from 'js2xmlparser';

/**
 * writes the given data object as xml file
 * @ignore
 * @param rootElement
 * @param data
 * @param targetFilePath
 * @returns {Promise} Returns a promise that resolves to the given targetFilePath
 */
export function writeXmlFile(rootElement, data, targetFilePath) {

  const xml = serialize(rootElement, data);

  createDirsForFilePath(targetFilePath);

  return Q.nfcall(fs.writeFile, targetFilePath, xml, 'UTF-8')
    .then(() => {
      return targetFilePath;
    });
}

/**
 * resolves the given path (to absolute),
 * generates all directories along the path
 *
 * @ignore
 * @param filePath path to a file
 */
function createDirsForFilePath(filePath) {
  mkdirp.sync(path.dirname(path.resolve(filePath)));
}

function serialize(rootElement, data) {
  // clone incoming data, since we change some properties!
  const dataClone = cloneDeep(data);

  // see https://github.com/michaelkourlas/node-js2xmlparser
  return js2xmlparser(rootElement, dataClone, {

    typeHandlers: {
      // automatically convert all dates to ISOString representation
      '[object Date]': function (date) {
        return date.toISOString();
      }
    },

    wrapHandlers: {
      // we want the array property "labels" to be represented as <labels><label>....</label></labels>
      labels: function () {
        return 'label';
      },
      // we want the array property "screenAnnotations" to be represented as <screenAnnotations><screenAnnotation>....</screenAnnotation></screenAnnotations>
      screenAnnotations: function () {
        return 'screenAnnotation';
      },

    }
  });
}


export default {writeXmlFile};
