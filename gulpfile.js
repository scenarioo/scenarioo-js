var gulp = require('gulp');

require('./build/dependencyCheck');
require('./build/lint');
require('./build/test');
require('./build/docu');
require('./build/build');

gulp.task('default', ['lint', 'test']);
