var
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    del = require('del');

gulp.task('test', ['cleanTestOut'], function () {
    return gulp.src('./test/unit/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('cleanTestOut', function () {
    return del('test/out/*');
});
