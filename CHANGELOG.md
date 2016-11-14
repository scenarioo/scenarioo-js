# Scenarioo JS Versions

## Version 3.0

### New Features
* Integrates easy with Jasmine 2 and Protractor
* Automatic screenshots on test failures and at end of tests
* Comes with more comfortable DSLs:
   * checkout the new "Fluent DSL"
   * for easy migration there is a "Backwards DSL"
* Can be used with vanilla Jasmine notation as well (if you want so)
* Can write more additional data to the documentation:
   * labels
   * screen annotations

### Bug Fixes
* Smaller fixes and improvements

### Breaking Changes
* Jasmine reporter depends on Jasmine 2 (writer can also be used without Jasmine, but this is the most common use case)
* The library API slighly changed, but there is a very easy migration path, check the migration guide: [Migration Guide](README.md#migration-guide). 

### Format Compatibility
* Compatible with Scenarioo Viewer 3.x and 2.x

## Version 0.1.9

Last Version of ScenariooJS that is compatible with Jasmine 1.

### Bug Fixes
* Improved page name extractor (remove query string for URLs with a # sign)
* Allow web tests to run without generating Scenarioo documentation (removed check in `saveStep`, `saveScenario` and `saveUseCase`).

### Format Compatibility
* Compatible with Scenarioo Viewer 3.x and 2.x

## Version 0.1.8

### New Features
* Allow description in `describeUseCase` and `describeScenario`
* Allow metadata in `saveStep`
* Custom page name extraction with `registerPageNameFunction()`

### Bug Fixes
* Smaller fixes and improvements

### Format Compatibility

* Compatible with Scenarioo Viewer 3.x and 2.x

## Version 0.1.7

First official ScnariooJS Release that can write most important parts of the Scenarioo documentation data format.

### Format Compatibility

* Compatible with Scenarioo Viewer 3.x and 2.x (maybe even 1.x, we do not remember ;-) )


