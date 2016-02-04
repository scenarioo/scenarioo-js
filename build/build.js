var
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del');

gulp.task('cleanLib', function () {
  return del('lib/*');
});

gulp.task('copyJsons', ['cleanLib'], function () {
  gulp.src('src/**/*.json')
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['copyJsons', 'lint', 'test'], function () {
  return gulp.src(['src/**/*.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('lib'));
});
