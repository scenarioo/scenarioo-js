const
  gulp = require('gulp'),
  del = require('del'),
  run = require('gulp-run');


gulp.task('cleanDocuOut', () => del('docu/*'));

gulp.task('docu', gulp.series(['cleanDocuOut'], () => {
  run('jsdoc src -r -d docu --readme ./README.md -c ./build/jsdoc.conf.json').exec().pipe(gulp.dest('output'));
}));
