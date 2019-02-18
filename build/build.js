const
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del');

gulp.task('cleanLib', () => del('lib/*'));

gulp.task('clean', gulp.series(['cleanLib']));

gulp.task('copyTypings', gulp.series(['cleanLib']), () => gulp.src('src/**/*.d.ts')
  .pipe(gulp.dest('lib')));

gulp.task('copyJsons', gulp.series(['cleanLib']), () => gulp.src('src/**/*.json')
  .pipe(gulp.dest('lib')));

gulp.task('build', gulp.series(['copyJsons', 'copyTypings', 'lint', 'test']), () => gulp.src('src/**/*.js')
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(gulp.dest('lib')));

