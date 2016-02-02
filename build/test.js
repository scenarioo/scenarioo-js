var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  del = require('del');

gulp.task('test', ['cleanTestOut'], function () {
  return gulp.src('./test/unit/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});


gulp.task('pre-coverage', function () {
  return gulp.src(['lib/**/*.js'])
    .pipe(istanbul({
      includeUntested: true
    }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test-coverage', ['cleanTestOut', 'cleanCoverageReport', 'pre-coverage'], function () {
  return gulp.src('./test/unit/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports({
      dir: './coverage-report',
      reporters: ['lcov'],
      reportOpts: {dir: './coverage-report'}
    }));
});

gulp.task('cleanTestOut', function () {
  return del('test/out/*');
});

gulp.task('cleanCoverageReport', function () {
  return del('./coverage-report/*');
});
