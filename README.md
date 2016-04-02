# scenarioo-js
> Scenarioo API for [WebDriverJs](https://code.google.com/p/selenium/wiki/WebDriverJs) e2e tests!

[![Version](https://badge.fury.io/js/scenarioo-js.png)](http://badge.fury.io/js/scenarioo-js)  [![Build Status](https://travis-ci.org/scenarioo/scenarioo-js.svg?branch=develop)](https://travis-ci.org/scenarioo/scenarioo-js)

Scenarioo API for Javascript to generate Scenarioo Documentations in WebDriverJS (and protractor) e2e tests.

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

See the **example** folder for more information.


## API

You can run `$ gulp docu` in order to create a browseable JSDoc API documentation.

## Migration (Subject to change)

### Jasmine2 Support

The next release of scenarioo-js will depend on jasmine2.  jasmine 1.x support will be dropped.
The current develop branch already includes this switch. Check the **example** for a working example.


### Application-specific DSL

The "describeScenarioo" and "describeUseCase" functions were removed.

Since we introduced `scenarioo.getScenarioContext()...`, we no longer need wrapper functions around "describe" and "it".

If you still want to use this, it's really simple to add custom wrapper functions yourself. See the **example** for more information.



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
