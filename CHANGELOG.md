# Scenarioo JS Versions

## Version 3.0

### Format Compatibility

* Compatible with Scenarioo Viewer 3.x and 2.x

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
* Bug fixes

### Breaking Changes
* Jasmine reporter depends on Jasmine 2 (writer can also be used without Jasmine, but this is the most common use case)
* The library API slighly changed, but there is a very easy migration path, check the migration guide: [Migration Guide](README.md#migration-guide). 

## Version 0.1.x

Initial first versions of basic Scenarioo Writer API to write Scenarioo documentation files out of protractor tests with Jasmine 1.

### Format Compatibility

* Compatible with Scenarioo Viewer 3.x and 2.x
