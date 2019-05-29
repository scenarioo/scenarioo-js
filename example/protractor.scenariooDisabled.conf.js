'use strict';


/**
 * Special configuration to test that the tests also work without scenarioo reporting turned on.
 */

var e2eBaseUrl = 'http://localhost:8081';

var exportsConfig = {

  // Usual protractor test config
  allScriptsTimeout: 11000,
  specs: ['test/**/*.spec.js'],
  baseUrl: e2eBaseUrl,
  rootElement: 'body',

  // Do not use selenium server but instead connect directly to chrome
  directConnect: true,

  /**
   * Enable & configure ScenariooJS reporter
   */
  onPrepare: function () {

    // Scenarioo is still needed, due to the DSL needed and calls to saveStep
    global.scenarioo = require('../lib');
    // instead in your real project use: global.scenarioo = require('scenarioo-js');

    // one of the following (or both) is only needed when you want to use one of the gloabaly defined scenarioo DSLs
    // which are helpful to describe your tests for the scenarioo documentation more easily.
    scenarioo.setupBackwardsDsl();
    scenarioo.setupFluentDsl();

  },

  params: {
    baseUrl: e2eBaseUrl
  },

  jasmineNodeOpts: {

    // Use following to suppress usual jasmine log:
    // print: function () {},

    // Only execute specs who's name match a certain pattern:
    // grep: 'failing',

    // Invert 'grep' matches, to execute the ones that do not match
    // invertGrep: true,

    // If true, print colors to the terminal.
    showColors: true,

    // If true, include stack traces in failures.
    includeStackTrace: true,

    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000

  }

};

exports.config = exportsConfig;
