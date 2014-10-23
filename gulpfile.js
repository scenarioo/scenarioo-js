var gulp = require('gulp');
var eslint = require('gulp-eslint');


var paths = {
  sources: 'lib/**.js'
};

gulp.task('lint', function () {
  return gulp.src(paths.sources)
    .pipe(eslint())
    .pipe(eslint.format());

});

gulp.task('default', ['lint']);
