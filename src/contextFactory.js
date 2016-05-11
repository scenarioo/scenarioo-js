import isArray from 'lodash/isArray';
import store from './scenariooStore';

/**
 * Since useCase and scenario both can have additional properties like "description" and "labels",
 * we can reuse the same code for setting these properties.
 *
 * @ignore
 * @param {string} objectName  either "scenario" or "useCase"
 * @returns {{setDescription: setDescription, addLabels: addLabels, setId: setId}}
 */
function contextFactory(objectName) {

  objectName = capitalizeFirstLetter(objectName);
  const updateContextObject = store[`updateCurrent${objectName}`];
  const getContextObject = store[`getCurrent${objectName}`];


  /**
   * @namespace context
   */
  return {
    setDescription,
    addLabels,
    getCurrent,
    setId
  };

  /**
   * @func context#setDescription
   * @param {string} description
   */
  function setDescription(description) {
    if (!store.isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      store.init({});
    }
    updateContextObject({description});
  }

  /**
   *
   * @func context#addLabels
   * @param {string | string[]} labels an array of strings or a single string
   */
  function addLabels(labels) {
    if (!labels) {
      return;
    }

    if (!store.isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      store.init({});
    }

    const currentContext = getContextObject();
    let mergedLabels = currentContext.labels || [];
    if (!isArray(labels)) {
      mergedLabels.push(labels);
    } else {
      mergedLabels = mergedLabels.concat(labels);
    }

    assertLabelFormat(mergedLabels);

    updateContextObject({
      labels: mergedLabels
    });
  }

  function getCurrent() {
    if (!store.isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      store.init({});
    }
    return getContextObject();
  }

  function setId(id) {
    if (!id) {
      return;
    }

    if (!store.isInitialized()) {
      // init an empty context and try to work on that, assuming that it is just scenarioo not enabled to write reports
      store.init({});
    }
    updateContextObject({id});
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// labels must match the following pattern.
// see https://github.com/scenarioo/scenarioo/wiki/Labels
const LABEL_PATTERN = /^[ a-zA-Z0-9_-]+$/;
function assertLabelFormat(labels) {
  labels.forEach(label => {
    if (!LABEL_PATTERN.test(label)) {
      throw new Error(`Given label "${label}" does not adhere to format`);
    }
  });
}

export default contextFactory;
