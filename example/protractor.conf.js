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
        'browserName': 'chrome'
    },

    baseUrl: e2eBaseUrl,

    rootElement: 'body',

    onPrepare: function () {
        // enable scenarioo userDocumentation (see more on http://www.scenarioo.org)
        require('jasmine-reporters');
        // pass in the current branch of your VCS you are testing, an arbitrary build name and the current revision you are testing.
        var scenariooReporter = require('../lib/scenarioo-js').reporter('./scenariodocu', 'master', 'the master branch', 'build_' + new Date(), '1.0.0');
        jasmine.getEnv().addReporter(scenariooReporter);
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
