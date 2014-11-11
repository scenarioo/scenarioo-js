'use strict';

var
  Q = require('q'),
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

module.exports = {
  logDirectoryTree: logDirectoryTree
};
