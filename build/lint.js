var
    gulp = require('gulp'),
    eslint = require('gulp-eslint');

gulp.task('lint', function () {

    var stream = gulp.src(['./lib/**/*.js', './test/unit/**/*.js', './build/*.js']);

    stream.pipe(eslint());

    if (process.env.BUILD_ENV === 'TRAVISCI') {
        stream.pipe(eslint.failOnError())
    }

    stream.pipe(eslint.format());

    return stream;

});
