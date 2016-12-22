# Scenarioo JS Versions

## Version 3.0.1

### Bug Fixes
* Improve TypeScript Typings for ScreenAnnotations to be 100% TypeScript conform ([#46](/scenarioo/scenarioo/#46))

### Format Compatibility
* Writes format 2.1 that is compatible with Scenarioo Viewer 3.x and 2.x

## Version 3.0

### New Features
* Integrates easily with Jasmine 2 and Protractor
* Comes with TypeScript Typings for using newest API in TypeScript
* Comes with more comfortable DSLs:
   * Brand new "Fluent DSL"
   * "Backwards DSL" for easy migration
* Can be used now with vanilla Jasmine test notation as well
* Automatic screenshots on test failures and at the end of tests
* Writes visible text for full text search into each step
* Can write more additional data to the documentation:
   * labels
   * screen annotations
* Improved Logging (can even be turned off and integrates nicely with jasmine's default output)
* Support to clean output directory before running tests

### Bug Fixes
* Smaller fixes and improvements

### Breaking Changes
* Jasmine reporter depends on Jasmine 2 (writer can also be used without Jasmine, but this is the most common use case)
* The library API slightly changed, but there is a very easy migration path. Check out the migration guide: [Migration Guide](README.md#migration-guide). 

### Format Compatibility
* Writes format 2.1 that is compatible with Scenarioo Viewer 3.x and 2.x

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


