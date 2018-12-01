var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  del = require('del');


var mochaOpts = {
  reporter: 'spec',
  compilers: ['js:@babel/register']
};

gulp.task('test', ['cleanTestOut'], function () {
  return gulp.src('./test/unit/**/*.js', {read: false})
    .pipe(mocha(mochaOpts));
});

gulp.task('cleanTestOut', function () {
  return del('test/out/*');
});
