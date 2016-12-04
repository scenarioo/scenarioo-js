# ScenariooJS
> Scenarioo writer library for javascript to document your e2e tests

[![Version](https://badge.fury.io/js/scenarioo-js.png)](http://badge.fury.io/js/scenarioo-js)  [![Build Status](https://travis-ci.org/scenarioo/scenarioo-js.svg?branch=develop)](https://travis-ci.org/scenarioo/scenarioo-js)

Using ScenariooJS in your protractor (or pure [WebDriverJs](https://code.google.com/p/selenium/wiki/WebDriverJs)) e2e tests you can generate a fancy e2e test documentation 
and make it available to everybody involved in your project through the Scenarioo Viewer web frontend.

## Introduction to Scenarioo

This is a sub project of Scenarioo.
For general information about Scenarioo check our webpage 
[http://www.scenarioo.org](http://www.scenarioo.org).

## Introduction to ScenariooJS

Presentation Slides from the Zühlke Client Technology Days 2016 Conference Session:
[Effective E2E Testing with ScenariooJS and Protractor](http://scenarioo.org/e2e-testing-with-scenarioo-js)
Refer to these slides as a good introduction and explanation of how to use and introduce it.

## Use

### Version Notice

This documentation is for version 3.x of ScenariooJS. See [Changelog](CHANGELOG.md).

### Installation

Install scenarioo-js via npm

```
$ npm install --save-dev scenarioo-js
```

Make sure to also install protractor (version greater 4.x recommended, version 3.x should also work)

```
$ npm install --save-dev protractor
```

Since protractor comes with command line tools, it is also recommend (for simplicity) to install protractor globally.

```
npm install --global protractor
webdriver-manager update
```

Otherwise you might have to define special scripts in your `package.json` file to use the command line tools from project's npm dependencies. 
This would be the preferred way of using protractor as a non-global dependency.

### Configuration

Configure scenarioo-js in your protractor config file.

```javascript

var scenarioo = require('scenarioo-js');

onPrepare: function onPrepare() {
    
    scenarioo.setupJasmineReporter(jasmine, {
      
      targetDirectory: './scenarioReports',
    
      // Information about the current software version being documented
      // usually fetched from your environment (e.g. passed via `process.env`)
      branchName: 'master',  // use your real branch (or product version) that you are documenting here
      branchDescription: 'the master branch',
      buildName: 'build_' + new Date(), // better use unique build identifier, if available
      revision: '1.0.0', // use e.g. git version here (e.g. `git describe --always`) 
      
      // Define a unique human readable identifier of the page the test is currently on (usually a part of the URL)
      pageNameExtractor: function (url) {
        return url.pathname.substring(1);
      },
      
      // Enable automatic screenshot step generated on each expectation failed
      reportStepOnExpectationFailed: true,
      
      // Enable to write last step of a scenario automatically for both failed and passed (=successful) test scenarios
      recordLastStepForStatus: {
         failed: true,
         success: true
      },
      
      // suppress additional helpful scenarioo log output (optional, defaults to false).
      disableScenariooLogOutput: false
      
    });  
      
    // Setup Fluent DSL (only if you need it, which is recommended)
    scenarioo.setupFluentDsl();
    
  }
  
```

### Writing Tests

#### Example Tests

A small example application with Scenarioo tests can be found under [example/](example/). 
Below we explain different ways to write UI Tests with ScenariooJS. 

For a quick reference, you can also have a look at the the following example files:

 - [Vanilla Jasmine](#vanilla-jasmine-style)
    - [exampleBasicJasmine.spec.js](example/test/exampleBasicJasmine.spec.js)
    - [exampleFailingTests.spec.js](example/test/exampleFailingTests.spec.js)
 - [Fluent DSL for simple and clean UI tests _(Recommended)_](#scenarioo-fluent-dsl)
    - [exampleFluentDsl.spec.js](example/test/exampleFluentDsl.spec.js)
    - [exampleFluentDslWithTypeScript.spec.ts](example/test/exampleFluentDslWithTypeScript.spec.ts)
    - [exampleFluentDslLabelDefinitions.spec.js](example/test/exampleFluentDslLabelDefinitions.spec.js)
    - [exampleFluentDslPendingUseCase.spec.js](example/test/exampleFluentDslPendingUseCase.spec.js)
 - [Backwards DSL for fast Migration from ScenariooJS 1 to ScenariooJS 2](#backwards-dsl-for-fast-migration)
    - [exampleBackwardsDsl.spec.js](example/test/exampleBackwardsDsl.spec.js)

#### Vanilla Jasmine Style

Write your e2e tests in your usual Jasmine style with Protractor
(or you could also use pure WebdriverJS without protractor, 
since ScenariooJS does not depend on protractor directly).

```javascript

describe('Example Usecase', function() {

  afterEach(scenarioo.saveLastStep);

  it('Example Scenario', function () {

    browser.get('/index.html');
    scenarioo.saveStep('start');

    element(by.css('li#my-item-one')).click();
    scenarioo.saveStep('one is displayed');

  });
});
```

ScenariooJS will report a useCase for every `describe` and a scenario for every `it` function in your test.

Also a step at the end of each test scenario (on failure or success) will be reported if you configured so (see configuration possibilities in `example/protractor.conf.js`).
We recommend to turn this on, because the last step is one of the most important ones in a test, especially if there are failures.

Additional steps of a scenario can be reported by manually calling `scenarioo.saveStep('stepName');` in your tests.

#### General Recommendations About Recording Steps

You can (and probably should) also hook `saveStep`-commands into your important page object functions (instead of directly in your tests).

Or you can try to do this by hooking into protractor functions, to ensure that a step is reported on every important action (e.g. every important click).

We recommend to do it in the page objects, because that is usually the place where you know, that something worthy of recording as a step happened.


#### Scenarioo Fluent DSL

For a nicer and cleaner syntax we recommend to use the **New Fluent DSL** of scenarioo to describe use cases and scenarios 
even easier in your tests and annotate them with additional important information for the documentation:

```javascript
useCase('Example Use Case with Fluent DSL')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .describe(function () {

    scenario('Example Scenario with Fluent DSL')
      .description('An optional but recommended description for the scenario')
      .labels(['happy', 'example-label'])
      .it(function () {

        browser.get('/index.html');
        step('browse to start page');
        
        // you could also hook such step method calls into your page objects or even the e2e test toolkit
        // (e.g. by overwriting protractor functions, like click on element)
        // to automatically document a step on each important interaction and not clutter your tests with such calls
        // (actually that is what we recommend for real projects and can be done easily).

        // more steps of this scenario would of course come here ...

      });
      
});
```

See [Examples](/example) for more information on how to use ScenariooJS and the different DSLs. 

#### Using Scenarioo with Typescript

There are now typings included for the Fluent DSL (only).
Since this is the API we recommend to use in future we only provide typings for this Fluent DSL.
See special Example with Fluent DSL in TypeScript 
[exampleFluentDslWithTypeScript.spec.ts](example/test/exampleFluentDslWithTypeScript.spec.ts))


#### Backwards DSL

There is also a `Backward DSL` that is only interesting for easier migration from old scenarioo 1.x tests to the new scenarioo 2.x library with jasmine 2. Refer to the migration guide below.

#### Define Custom App-specific DSL

In case you want to define your own custom DSL for your specific application under test, to be able to document and test it more easily,
you are free to do so, by simply copying our Scenarioo Fluent DSL from this one simple javascript file here as a blueprint for your own DSL:
[fluentDsl.js](src/dsl/fluentDsl.js)

### Generate and Browse Documentation

Run your protractor tests (e.g. as explained in [Examples Readme](/example/README.MD)) to run the tests and generate scenarioo documentation data. 
This documentation can then be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).

## Migration Guide

This migration guide explains how to switch from SceanriooJS 1.x to ScenariooJS 2.x

### Jasmine 2 Support

Version 2.x of scenarioo-js will depend on jasmine 2.  jasmine 1.x support will be dropped.
Check the [Examples](/example) for a working example.

### Scenarioo Configuration

The configuration of the reporter has become more easier and has to be changed accordingly in the preparation code of your end-2-end tests.

The `scenarioo.reporter` is not available anymore. Instead you just have to call the setup function `scenarioo.setupJasmineReporter` to setup the reporter for you with jasmine 2.

See documentation above for `Configuration` to see how this works now.

### Application-specific DSL

The `scenarioo.describeScenario` and `scenarioo.describeUseCase` functions are not defined anymore out of the box, 
and have either to be replaced by pure jasmine, a custom written DSL or by one of the out of the box provided DSLs.

We recommend to use the new `Fluent DSL` or your own defined Application-Specific DSL 
but for a fast migration it might be most easy to use the `Backwards DSL`, that is provided only for fast migration.
 
### Backwards DSL for Fast Migration 

Using Backwards DSL you can use the same old functions, that you had in ScenariooJS 0.x and 1.x.

The `Backwards DSL` can be activated as follows:

```
// call this in your protractor onPrepare code to activate backwards DSL functions
scenarioo.setupBackwardsDsl();
```

This brings you the old 1.x style DSL with `describeUseCase` and `describeScenario` functions back, for easier migration
(with or without `scenarioo.` in front, both works).

You can then later migrate those tests to the new `Fluent DSL` or even your own defined DSL or the pure vanilla jasmine 2 syntax.
We recommend to have a look at the new [Examples](/example) to see what style fits best for your project.

### Save Steps with `scenarioo.saveStep`

The "saveStep" function is now directly exposed on scenarioo:

```javascript
scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario ', function () {
    scenarioo.saveStep('start'); // instead of scenarioo.docuWriter.saveStep
  });

});
```
