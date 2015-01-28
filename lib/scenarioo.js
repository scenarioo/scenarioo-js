'use strict';

var
  docuWriter = require('./docuWriter/docuWriter'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path');

var availableReporters = listJsFilesInDirectory(path.join(__dirname, './reporters'));
var availableAdapters = listJsFilesInDirectory(path.join(__dirname, './adapters'));

var adapter;
var reporter;

function listJsFilesInDirectory(directoryPath) {

  function isJSFile(fileName) {
    return (fileName.split('.').pop() === 'js');
  }

  function stripFileExtension(fileName) {
    return path.basename(fileName, '.js');
  }

  var files = {};
  fs.readdirSync(directoryPath).forEach(function (file) {
    if (isJSFile(file)) {
      files[stripFileExtension(file)] = path.join(directoryPath, file);
    }
  });
  return files;
}

/**
 * Specify which reporter (test-framework) to use.
 * Either specify a name for one of the build-int reporters or pass in your custom reporter.
 *
 * @param {string|object} reporterNameOrCustom
 */
function useReporter(reporterNameOrCustom) {
  if (_.isString(reporterNameOrCustom)) {
    if (availableReporters[reporterNameOrCustom]) {
      reporter = require(availableReporters[reporterNameOrCustom]);
    } else {
      throw new Error('Reporter ' + reporter + ' not found!');
    }
  } else {
    reporter = reporterNameOrCustom;
  }
}

/**
 * Specify which adapter (selenium driver adapter) to use.
 * Either specify a name for one ot the built-in adapter or pass in your custom adapter.
 *
 * @param {string|object} adapterNameOrCustom
 */
function useAdapter(adapterNameOrCustom) {
  if (_.isString(adapterNameOrCustom)) {
    if (availableAdapters[adapterNameOrCustom]) {
      adapter = require(availableAdapters[adapterNameOrCustom]);
    } else {
      throw new Error('Adapter ' + adapter + ' not found!');
    }
  } else {
    adapter = adapterNameOrCustom;
  }
}

function getReporter() {
  return reporter;
}

function getAdapter() {
  return adapter;
}

function reset() {
  reporter = undefined;
  adapter = undefined;
}

function init(options) {
  if (!_.isPlainObject(options) || !options.targetDirectory || !options.branch || !options.build || !options.revision) {
    throw new Error('Please provide valid options');
  }
  if (!reporter) {
    throw new Error('Please register a reporter by invoking "scenarioo.useReporter(...)');
  }
  if (!adapter) {
    throw new Error('Please register an adapter by invoking "scenarioo.useAdapter(...)');
  }

  docuWriter.init(reporter, adapter);

  reporter.onInit(options.targetDirectory, options.branch, options.build, options.revision);
}

var scenarioo = {
  useReporter: useReporter,
  useAdapter: useAdapter,
  getReporter: getReporter,
  getAdapter: getAdapter,
  init: init,
  reset: reset,
  docuWriter: docuWriter
};


// load dsl in order to register global functions
require('./dsl')(scenarioo);

module.exports = scenarioo;
