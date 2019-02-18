const
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del');

gulp.task('clean', () => del('lib/*'));

gulp.task('copyTypings', () => gulp.src('src/**/*.d.ts').pipe(gulp.dest('lib')));

gulp.task('copyJsons', () => gulp.src('src/**/*.json').pipe(gulp.dest('lib')));

gulp.task('build', gulp.series(['clean', 'copyJsons', 'copyTypings', 'lint', 'test'], () => gulp.src('src/**/*.js')
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(gulp.dest('lib'))));

