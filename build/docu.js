var
  gulp = require('gulp'),
  del = require('del'),
  run = require('gulp-run');


gulp.task('docu', ['cleanDocuOut'], function () {
  run('jsdoc src -r -d docu --readme ./README.md -c ./build/jsdoc.conf.json').exec().pipe(gulp.dest('output'));
});

gulp.task('cleanDocuOut', function () {
  return del('docu/*');
});
