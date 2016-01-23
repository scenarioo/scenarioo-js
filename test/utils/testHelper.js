'use strict';

var
    assert = require('assert'),
    xml2js = require('xml2js'),
    Q = require('q'),
    fs = require('fs'),
    findit = require('findit');


function logDirectoryTree(rootDir) {

    var deferred = Q.defer();

    var find = findit(rootDir);

    find.on('file', function (file) {
        console.log(file);
    });

    find.on('directory', function (file) {
        console.log(file);
    });

    find.on('end', function () {
        deferred.resolve();
    });

    find.on('error', function () {
        deferred.reject();
    });

    return deferred.promise;
}

function assertXmlContent(filePath, content, done) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            done(err);
            return;
        }

        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            if (err) {
                done(err);
                return;
            }
            assert.deepEqual(result, content);

            done();
        });
    });
}

function assertFileExists(filePath) {
    return Q.nfcall(fs.stat, filePath);
}

module.exports = {
    logDirectoryTree: logDirectoryTree,
    assertXmlContent: assertXmlContent,
    assertFileExists: assertFileExists
};
