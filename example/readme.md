# Example

This example shows how to use scenarioo-js in a protractor (webdriverJS) environment.

example/app contains a very simple angularJS application.

build the scenarioo js writer library (in scenarioo-js root)

```
npm install
gulp build
```

build and serve the example app (in scenarioo-js root)
 
```
npm install
http-server -p 8081 example
```

Install protractor and install or update the chrome webriver (we install it globaly here, because this is more easy to use from command line, you can also try to use the local one, but we encountered less problems with using the global one)

```
npm install -g protractor
webdriver-manager update
```

Start the protractor tests:

```
protractor example/protractor.conf.js
```

Don't be alarmed, the second e2e test will fail (in order to have a failing run in the scenario documentation).

Afterwards you'll find the generated scenarioo documentation inside `/scenariooReports`.

This generated documentation can be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).
