# Example

This example shows how to use scenarioo-js in a protractor (webdriverJS) environment.

`example/app` contains a very simple angularJS application, which can be used for demonstration purposes and as well if 
intend to contribute developing *scenarioo-js*.

Build the scenarioo js writer library (in `scenarioo-js` root) and run the example application:

```
npm install
npm run build
```

serve the example application
by calling following in directory scenarioo-js root

```
npm run serve-example
```

Install needed dependencies (protractor) and run the tests:

```
npm install
npm run e2e
```

**Don't be alarmed when this fails with errors, this is expected!**

**You should see following in the output:**<br/>
```
16 specs, 5 failures, 5 pending specs
```

This is for testing and demonstrating how test failures and also pending tests are reported in scenarioo.

Afterwards you'll find the generated scenarioo documentation inside `/scenariooReports`.

This generated documentation can be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).
