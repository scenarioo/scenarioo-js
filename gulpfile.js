var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  eslint = require('gulp-eslint'),
  del = require('del');

var paths = {
  sourceFiles: './lib/**/*.js',
  testFiles: './test/unit/**/*.js'
};

gulp.task('cleanTestOut', function (done) {
  del('test/out/*', function (err) {
    done(err);
  });
});

gulp.task('lint', function () {
  return gulp.src([paths.sourceFiles, paths.testFiles])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', ['cleanTestOut', 'lint'], function () {
  return gulp.src(paths.testFiles, {read: false})
    .pipe(mocha({reporter: 'spec'}));
});


gulp.task('default', ['test']);
