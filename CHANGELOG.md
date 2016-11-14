# Version 3.0

Produces output that is compatible with Scenarioo Viewers 3.x and is also backward compatible with Viewers of version 2.x

Improved Writer Library for Scenarioo:
* Compatible with Jasmine 2
* Comes with more comfortable advanced DSLs: checkout the new "Fluent DSL"
* Can be used with vanilla Jasmine notation as well
* Can write more additional data to the documentation
* Automatic screenshots on test failures and at end of tests
* bug fixes

Breaking Changes:
* Jasmine reporter depends on Jasmine 2 (writer can also be used without Jasmine, but this is the most common use case)
* The library API slighly changed, but there is a very easy migration path, check the migration guide: [Migration Guide](README.md#migration-guide). 

**Why is this version called 3.0?**<br/> 
Because it is part of the next big Scenarioo Release Package, which is 3.0, 
and we are using same major version for all our components, as much as possible.
Still this release is comaptible with Scenarioo 2.x Viewers.

# Version 0.1.x

Initial first versions of basic Scenarioo Writer API to write Scenarioo documentation files out of protractor tests with Jasmine 1.
