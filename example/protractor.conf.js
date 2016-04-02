'use strict';

var e2eBaseUrl = 'http://localhost:8081';

var exportsConfig = {

  // usual protractor test config
  allScriptsTimeout: 11000,
  specs: ['test/**/*.spec.js'],
  baseUrl: e2eBaseUrl,
  rootElement: 'body',

  /**
   * Enable & configure ScenariooJS reporter
   */
  onPrepare: function () {

    // Read current software version that is documented from source control info
    var gitVersion = readVersionFromGit();

    // import scenariooJS as globaly available reporting tool in your ese tests
    global.scenarioo = require('../lib');
    // instead in your real project use: global.scenarioo = require('scenarioo-js');

    // Configure the ScenariooJS reporter
    var scenariooReporter = scenarioo.reporter({

      // target directory: where the scenarioo documentation data is generated
      targetDirectory: './scenariooReports',

      // branch name: this is usually read from current version control information or set to reflect the major version of your software that you document
      // ("master" and "develop", or "Release 1.0", "Release 1.1", and so on ...)
      // it does not necessarily have to conform to the real development branch names in your source control,
      // sometimes it is better to use names of the version, release or whatever it documents
      branchName: 'master',

      // put some description here, such that everybody understands, what this branch contains (which version, release, ...)
      branchDescription: 'mainline branch',

      // unique build name: use a timestamp, or better a build ID of current CI build running
      buildName: 'build_' + gitVersion + '_' + new Date().getTime(),

      // set a revision: you could put your product version in combination with the latest source code revision
      // (either also the build ID or a commit ID)
      revision: gitVersion,

      // Here you configure how pages in your software are identified in the documentation
      // by generating a unique page name from current URL (usually a part of the URL, without special page content parameters)
      pageNameExtractor: function (url) {
        return url.pathname.substring(1);
      }

    });
    jasmine.getEnv().addReporter(scenariooReporter);

    // Include your DSL that you want to use to describe your tests (if any)
    // the following DSLs are included in this example to demonstrate example custom DSLs ("describeScenario", "describeUseCase")
    // you do not necessarily need this when you want to simply use describe and it notation of jasmine
    require('./dsl/customDslBasic');
    require('./dsl/customDslExtended');
    require('./dsl/customDslFluent');

    /**
     * Calling your source control tool to get current revision
     * (here git version of your current sources)
     */
    function readVersionFromGit() {
      var execSync = require('child_process').execSync;
      var version = "" + execSync('git describe --always');
      console.log('git version: ' + version);
      return version.substring(0,version.length - 1);
    }

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
