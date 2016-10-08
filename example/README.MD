# Example

This example shows how to use scenarioo-js in a protractor (webdriverJS) environment.

example/app contains a very simple angularJS application.

build the scenarioo js writer library (in scenarioo-js root)

```
npm install
gulp build
```

serve the example application
by calling following in directory scenarioo-js root

```
npm run serve-example
```

Install protractor and install or update the chrome webriver (we install it globaly here, because this is more easy to use from command line, you can also try to use the local one, but we encountered less problems with using the global one)

```
npm install -g protractor
webdriver-manager update
```

Start the protractor tests:

```
cd example
protractor protractor.conf.js
```

Don't be alarmed when some of the tests failed.

You should see:
10 specs, 3 failures, 4 pending specs


This is for testing and demonstrating how test failures and also pending tests are reported in scenarioo.

Afterwards you'll find the generated scenarioo documentation inside `/scenariooReports`.

This generated documentation can be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).
