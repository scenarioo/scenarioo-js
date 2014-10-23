var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var del = require('del');

var paths = {
  sourceFiles: 'lib/*.js',
  testFiles: 'test/spec/*_spec.js'
};

gulp.task('clean', function (done) {
  del('test/out/*', function (err) {
    done(err);
  });
});

gulp.task('lint', function () {
  return gulp.src([paths.sourceFiles, paths.testFiles])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', ['clean'], function () {
  return gulp.src(paths.testFiles, {read: false})
    .pipe(mocha({reporter: 'spec'}));
});


gulp.task('default', ['lint', 'test']);
