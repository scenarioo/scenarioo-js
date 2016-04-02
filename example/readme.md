# Example

This example shows how to use scenarioo-js in a protractor (webdriverJS) environment.

example/app contains a very simple angularJS application.

run npm install to prepare the example app

```
npm install
```

Run webdriver-manager (protractor) to download selenium dependencies and chrome driver.

```
node_modules/protractor/bin/webdriver-manager update
```

Build scenarioo-js by running `gulp build` in the root directory:

```
gulp build
```

Start to serve the webapplication under test:

```
http-server -p 8081 .
```

Start the protractor tests:

```
protractor protractor.conf.js
```

Don't be alarmed, the second e2e test will fail (in order to have a failing run in the scenario documentation).

Afterwards you'll find the generated scenarioo documentation inside `/scenariooReports`.

This generated documentation can be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).
