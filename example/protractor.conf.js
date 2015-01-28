'use strict';

var path = require('path');

var e2eBaseUrl = 'http://localhost:8081';

var exportsConfig = {

  framework: 'jasmine',

  // The location of the selenium standalone server .jar file.
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',
  // find its own unused port.
  seleniumPort: null,

  chromeDriver: './node_modules/protractor/selenium/chromedriver',
  seleniumArgs: [],

  allScriptsTimeout: 11000,

  specs: [
    'test/**/*Spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: e2eBaseUrl,

  rootElement: 'body',

  onPrepare: function () {
    var scenarioo = require('scenarioo-js');
    scenarioo.useReporter('jasmine');
    scenarioo.useAdapter('protractor');

    // pass in the current branch of your VCS you are testing, an arbitrary build name and the current revision you are testing.
    scenarioo.init({
      targetDirectory: path.join(__dirname, './scenariodocu'),
      branch: 'master',
      build: 'build_' + new Date().toISOString(),
      revision: '1.0.0'
    });

  },

  params: {
    baseUrl: e2eBaseUrl
  },

  jasmineNodeOpts: {
    // onComplete will be called just before the driver quits.
    onComplete: null,
    // If true, display spec names.
    isVerbose: false,
    // If true, print colors to the terminal.
    showColors: true,
    // If true, include stack traces in failures.
    includeStackTrace: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000
  }
};

exports.config = exportsConfig;
