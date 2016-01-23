var
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    del = require('del');

    
gulp.task('test', ['cleanTestOut'], function () {
    return gulp.src('./test/unit/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('cleanTestOut', function (done) {
    del('test/out/*', function (err) {
        done(err);
    });
});
