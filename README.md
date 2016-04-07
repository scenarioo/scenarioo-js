# ScenariooJS
> Scenarioo writer library for javascript to document your e2e tests

[![Version](https://badge.fury.io/js/scenarioo-js.png)](http://badge.fury.io/js/scenarioo-js)  [![Build Status](https://travis-ci.org/scenarioo/scenarioo-js.svg?branch=develop)](https://travis-ci.org/scenarioo/scenarioo-js)

Using ScenariooJS in your protractor (or pure [WebDriverJs](https://code.google.com/p/selenium/wiki/WebDriverJs)) e2e tests you can generate a fancy e2e test documentation.

This is a subproject of Scenarioo, for more information on scenarioo, check http://www.scenarioo.org.

## Use

### Installation

Install scenarioo-js via npm

```
$ npm install -D scenarioo-js
```

Make sure to also install protractor (v3.x)

```
$ npm install -D protractor
```

Since protractor comes with command line tools, it is also recommend (for simplicity) to install protractor globaly.

```
npm install -g protractor
webdriver-manager update
```


### Configuration

Configure scenarioo-js in your protractor config file.

```javascript
onPrepare: function () {
    
    global.scenarioo = require('scenarioo-js');
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
      }
      
    });  
      
    // Setup Fluent DSL (only if you need it, which is recommended)
    scenarioo.setupFluentDsl();
    
  },
```

### Tests

Write your e2e tests in your normal jasmine/protractor style.

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

ScenariooJS will report a useCase for every "describe" and a scenario for every "it" function in your test.
Also a step at the end of each test scenario (on failure or success) will be reported if you configured so.

Additional steps of a scenario can be reported by manually calling `scenarioo.saveStep('stepName');` in your tests.

You could also hook it into protractor or your page objects to ensure that on every important action (e.g. every click) a step is reported.


Or even better: We recommend to use the **New Fluent DSL** to even more easily describe usecases and scenarios in your tests and annotate them with additional important informations for the documentation:

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

        // use global step method to document interaction steps inside the scenario (with screenshot, etc.)
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

### Generate and Browse Documentation

Run your protractor tests (e.g. as explained in [Examples Readme](/example/readme.md)) to run the tests and generate scenarioo documentation data. 
This documentation can then be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).

## API Documentation

You can run `$ gulp docu` in order to create a browseable JSDoc API documentation of ScenariooJS.

## Migration (Subject to change)

### Jasmine2 Support

The next release of scenarioo-js will depend on jasmine2.  jasmine 1.x support will be dropped.
The current develop branch already includes this switch. Check the **example** for a working example.


### Application-specific DSL

The "describeScenarioo" and "describeUseCase" functions were removed.

Since we introduced `scenarioo.getScenarioContext()...`, we no longer need wrapper functions around "describe" and "it".

If you still want to use such a more explicit style of defining usecases and scenarios in your tests, it's really simple to add custom wrapper functions yourself.

See [DSL Examples in the Example](/example) for more information on what kind of even more advanced application specific DSLs could be useful in your projects. 
We recommend to use something like the [Fluent DSL Example](/example/test/sampleCustomDslFluent.spec.js).

### Protractor configuration

scenarioo.reporter is now a factory function. (omit the "new" keyword)

scenarioo.reporter takes now an options object.

```javascript
onPrepare: function () {
   var scenariooReporter = require('scenarioo-js').reporter({
     targetDirectory: './scenariodocu',
     branchName: 'master',
     branchDescription: 'the master branch',
     buildName: 'build_' + new Date(),
     revision: '1.0.0',
     pageNameExtractor: function (url) {
       return url.pathname.substring(1);
     }
   });
   jasmine.getEnv().addReporter(scenariooReporter);
}
```

### saveStep

The "saveStep" function is now directly exposed on scenarioo.


```javascript
scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario ', function () {
    scenarioo.saveStep('start'); // instead of scenarioo.docuWriter.saveStep
  });

});
```
