var
  gulp = require('gulp'),
  exec = require('child_process').exec,
  del = require('del');

gulp.task('docu', ['cleanDocuOut'], function (done) {
  exec('./node_modules/.bin/jsdoc lib -r -d docu --readme ./README.md', done);
});

gulp.task('cleanDocuOut', function () {
  return del('docu/*');
});
