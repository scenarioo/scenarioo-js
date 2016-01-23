var gulp = require('gulp');
 
require('./build/dependencyCheck');
require('./build/lint');
require('./build/test');

gulp.task('default', ['lint', 'test']);
