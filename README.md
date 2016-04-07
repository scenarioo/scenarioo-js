# scenarioo-js
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
Usually, you'd want to fetch information about the current branch + build from your environment (via `process.env`).

```javascript
 onPrepare: function () {
    // pass in the current branch of your VCS you are testing, a unique build name and the current revision you are testing.
    var scenariooReporter = require('../lib/scenarioo-js').reporter({
      targetDirectory: './scenariodocu',
      branchName: 'master',
      branchDescription: 'the master branch',
      buildName: 'build_' + new Date(),
      revision: '1.0.0', // use e.g. git version here
      pageNameExtractor: function (url) {
        return url.pathname.substring(1);
      }
    });
    jasmine.getEnv().addReporter(scenariooReporter);
  },
```


### Tests

Write your e2e tests in your normal jasmine/protractor style.

```javascript

describe('Example Usecase', function() {

  it('Example Scenario', function () {

    browser.get('/index.html');
    scenarioo.saveStep('start');

    element(by.css('li#my-item-one')).click();
    scenarioo.saveStep('one is displayed');

  });

});

```

scenarioo-js will report a useCase for every "describe" and a scenario for every "it" function in your test.

Currently, steps are reported by manually calling `scenarioo.saveStep('stepName');`

You could also hook it into protractor or your page objects to ensure that on every important action (e.g. every click) a step is reported automatically.

See [Examples](/example) for more information on how to use it.

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
