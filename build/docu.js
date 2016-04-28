var
  gulp = require('gulp'),
  exec = require('child_process').exec,
  del = require('del'),
  run = require('gulp-run');


gulp.task('docu', ['cleanDocuOut'], function () {
  run('jsdoc src -r -d docu --readme ./README.md').exec().pipe(gulp.dest('output'));
});

gulp.task('cleanDocuOut', function () {
  return del('docu/*');
});
