'use strict';

var
  fs = require('fs'),
  pathSeparator = require('path').sep;


function mkdirSync(path) {

  var dirs = path.split(pathSeparator);
  var root = '';

  while (dirs.length > 0) {
    var dir = dirs.shift();
    if (dir === '') {// If directory starts with a /, the first path will be an empty string.
      root = pathSeparator;
    }
    if (!fs.existsSync(root + dir)) {
      fs.mkdirSync(root + dir);
    }
    root += dir + pathSeparator;
  }
}

function mkdir(path, callback) {
  var dirs = path.split(pathSeparator);
  var root = '';

  function mkDir() {
    var dir = dirs.shift();
    if (dir === '') {// If directory starts with a /, the first path will be an empty string.
      root = pathSeparator;
    }
    fs.exists(root + dir, function (exists) {
      if (!exists) {
        fs.mkdir(root + dir, function () {
          root += dir + pathSeparator;
          if (dirs.length > 0) {
            mkDir();
          } else if (callback) {
            callback();
          }
        });
      } else {
        root += dir + pathSeparator;
        if (dirs.length > 0) {
          mkDir();
        } else if (callback) {
          callback();
        }
      }
    });
  }

  mkDir();
}

module.exports = {
  mkdir: mkdir,
  mkdirSync: mkdirSync
};
