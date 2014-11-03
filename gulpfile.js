var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var del = require('del');

var paths = {
  sourceFiles: 'lib/*.js',
  testFiles: 'test/unit/*.js'
};

gulp.task('cleanTestOut', function (done) {
  del('test/out/*', function (err) {
    done(err);
  });
});

gulp.task('lint', function () {
  return gulp.src([paths.sourceFiles, paths.testFiles])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', ['cleanTestOut'], function () {
  return gulp.src(paths.testFiles, {read: false})
    .pipe(mocha({reporter: 'spec'}));
});


gulp.task('default', ['lint', 'test']);
