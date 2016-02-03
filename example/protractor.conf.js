'use strict';

var e2eBaseUrl = 'http://localhost:8081';

var exportsConfig = {

  framework: 'jasmine2',

  // The location of the selenium standalone server .jar file.
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.48.2.jar',
  // find its own unused port.
  seleniumPort: null,

  chromeDriver: './node_modules/protractor/selenium/chromedriver',
  seleniumArgs: [],

  allScriptsTimeout: 11000,

  specs: [
    'test/**/*Spec.js'
  ],

  capabilities: {
    browserName: 'chrome'
  },

  baseUrl: e2eBaseUrl,

  rootElement: 'body',

  onPrepare: function () {
    // enable scenarioo userDocumentation (see more on http://www.scenarioo.org)
    // pass in the current branch of your VCS you are testing, an arbitrary build name and the current revision you are testing.
    var scenariooReporter = require('../lib/scenarioo-js').reporter({
      targetDirectory: './scenariodocu',
      branchName: 'master',
      branchDescription: 'the master branch',
      buildName: 'build_' + new Date().getTime(),
      revision: '1.0.0',
      pageNameExtractor: function (url) {
        return url.pathname.substring(1);
      }
    });
    jasmine.getEnv().addReporter(scenariooReporter);



    // this demonstrates how to include your own dsl ("describeScenario", "describeUseCase")
    // you do not need this in a basic setup.
    require('./test/customDsl');
    require('./test/customExtendedDsl');
    require('./test/chainedDsl');
  },

  params: {
    baseUrl: e2eBaseUrl
  },

  jasmineNodeOpts: {

    // Function called to print jasmine results.
    print: function () {
    },
    // If set, only execute specs whose names match the pattern, which is
    // internally compiled to a RegExp.
    //grep: 'failing',
    // Inverts 'grep' matches
    // invertGrep: false,

    // If true, print colors to the terminal.
    showColors: true,
    // If true, include stack traces in failures.
    includeStackTrace: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000
  }
};

exports.config = exportsConfig;
