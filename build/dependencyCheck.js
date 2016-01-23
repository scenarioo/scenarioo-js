var
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    q = require('q'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    ncu = require('npm-check-updates');

function getPackageInformation() {
    var pkg = require(path.join(__dirname, '../package.json'));
    return {
        currentDependencies: _.merge({}, pkg.dependencies, pkg.devDependencies),
        name: pkg.name
    };
}

/**
 * Check our 3rd party npm modules defined as dependencies/devDependencies in our package.json
 */
gulp.task('checkNpmDependencies', function (done) {
    gutil.log('This can take a minute...');

    var reportFileName = './npm_dependencies_report.md';

    ncu.run({
        packageFile: 'package.json',
        'error-level': 1 // we don't want to fail CI... we write a report file
    }).then(function (upgraded) {
        var tmpl = '# NPM DependencyCheck Report for <%- name %>\nThe following dependencies are out-of-date:\n\n<% _.forEach(upgraded, function(version, dependency) { %>* <%- dependency %>: <%- currentDependencies[dependency]%> -> <%- version%>\n<% }); %>';
        return _.template(tmpl)(_.merge({
            upgraded: upgraded
        }, getPackageInformation()));
    }).then(function (report) {
        return q.nfcall(fs.writeFile, reportFileName, report);
    }).then(function () {
        gutil.log(gutil.colors.green('Report saved to ' + reportFileName));
    }).catch(done);

});
