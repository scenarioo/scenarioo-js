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
