const
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  del = require('del');


const mochaOpts = {
  reporter: 'spec',
  compilers: ['js:@babel/register']
};

gulp.task('cleanTestOut', () => del('test/out/*'));

gulp.task('test', gulp.series(['cleanTestOut']), () => gulp.src('./test/unit/**/*.js', {read: false})
  .pipe(mocha(mochaOpts)));
