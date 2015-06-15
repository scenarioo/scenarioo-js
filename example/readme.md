# Example

This example shows how to use scenarioo-js in a protractor (webdriverJS) environment.

example/app contains a very simple angularJS application.

run npm install and bower install to prepare the example app

```
npm install
```

```
bower install
```

Run webdriver-manager (protractor) to download selenium dependencies and chrome driver.

```
node_modules/protractor/bin/webdriver-manager update
```

Then run 'runExample.sh' in order to start a http server that serves the angularJS application and trigger protractor e2e tests.
Afterwards you'll find the generated scenarioo documentation in /scenariodocu.

Don't be alarmed, the second e2e test will fail (in order to have a failing run in scenario documentation).
