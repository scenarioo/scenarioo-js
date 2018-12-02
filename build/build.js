var
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del');

gulp.task('clean', ['cleanLib']);

gulp.task('cleanLib', function () {
  return del('lib/*');
});

gulp.task('copyTypings', ['cleanLib'], function () {
  return gulp.src('src/**/*.d.ts')
    .pipe(gulp.dest('lib'));
});

gulp.task('copyJsons', ['cleanLib'], function () {
  return gulp.src('src/**/*.json')
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['copyJsons', 'copyTypings', 'lint', 'test'], function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('lib'));
});

