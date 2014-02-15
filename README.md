# scenarioo-js

Scenarioo API for Javascript to generate Scenarioo Documentations


## Documentation

### Development Guide
```
run npm install within the scenarioo-js directory
run grunt nodeunit to run the tests
```

### Use scenarioo-js in your protractor e2e tests
```javascript
var scenarioo = require('./../scenarioo/scenarioo.js');

scenarioo.describeUseCase('MySuperUseCase', function () {

    scenarioo.describeScenario('User can do awesome stuff with my webapp', function () {

        browser.get('some/path/in/my/webapp');
        scenarioo.docuWriter.saveStep('webform in my webapp shown');

        // doing some clicks, enter some date

        scenarioo.docuWriter.saveStep('form filled in');

        // submit form

        scenarioo.docuWriter.saveStep('confirmation page in my webapp shown');

    });

});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 xeronimus  
Licensed under the GNU, GENERAL, PUBLIC, LICENSE licenses.
