var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  babelRegister = require('babel-register'),
  del = require('del');


var mochaOpts = {
  reporter: 'spec',
  // our code is written in ES2015, transpile with babel before running mocha tests
  // note, when you run mocha from the command line :  mocha --compilers js:babel-register
  compilers: {
    js: babelRegister
  }
};

gulp.task('test', ['cleanTestOut'], function () {
  return gulp.src('./test/unit/**/*.js', {read: false})
    .pipe(mocha(mochaOpts));
});

gulp.task('cleanTestOut', function () {
  return del('test/out/*');
});
