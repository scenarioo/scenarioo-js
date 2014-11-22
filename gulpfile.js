var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  eslint = require('gulp-eslint'),
  del = require('del');

var paths = {
  sourceFiles: './lib/*.js',
  testFiles: './test/unit/*.js'
};

gulp.task('cleanTestOut', function (done) {
  del('test/out/*', function (err) {
    done(err);
  });
});

gulp.task('lint', function () {

  var stream = gulp.src([paths.sourceFiles, paths.testFiles]);

  stream.pipe(eslint());

  if (process.env.BUILD_ENV === 'TRAVISCI') {
    stream.pipe(eslint.failOnError())
  }

  stream.pipe(eslint.format());

  return stream;

});

gulp.task('test', ['cleanTestOut'], function () {
  return gulp.src(paths.testFiles, {read: false})
    .pipe(mocha({reporter: 'spec'}));
});


gulp.task('default', ['lint', 'test']);
