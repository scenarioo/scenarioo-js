const gulp = require('gulp');

require('./build/lint');
require('./build/test');
require('./build/docu');
require('./build/build');

gulp.task('default', gulp.series(['lint', 'test']));
