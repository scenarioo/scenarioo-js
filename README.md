# scenarioo-js
> Scenarioo API for [WebDriverJs](https://code.google.com/p/selenium/wiki/WebDriverJs) e2e tests!

[![Version](https://badge.fury.io/js/scenarioo-js.png)](http://badge.fury.io/js/scenarioo-js)  [![Build Status](https://travis-ci.org/scenarioo/scenarioo-js.svg?branch=develop)](https://travis-ci.org/scenarioo/scenarioo-js)

Scenarioo API for Javascript to generate Scenarioo Documentations in WebDriverJS (and protractor) e2e tests.

This is a subproject of Scenarioo, for Wiki documentation and more informations see here: https://github.com/scenarioo/scenarioo/wiki

## Jasmine2 Support

The next release of scenarioo-js will depend on jasmine2.  jasmine 1.x support will be dropped.
The current develop branch already includes this switch. Check the *example* for a working example.

### Migration (Subject to change)

#### Protractor configuration

scenarioo.reporter is now a factory function. (omit the "new" keyword)

scenarioo.reporter takes now a options object.

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

#### saveStep

The "saveStep" function is now directly exposed on scenario.


```javascript
scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario ', function () {
    scenarioo.saveStep('start'); // instead of scenarioo.docuWriter.saveStep
  });

});
```

