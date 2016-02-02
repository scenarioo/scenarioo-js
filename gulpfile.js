var gulp = require('gulp');

require('./build/dependencyCheck');
require('./build/lint');
require('./build/test');
require('./build/docu');

gulp.task('default', ['lint', 'test']);
