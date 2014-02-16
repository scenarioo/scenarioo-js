/* scenarioo-client
 * Copyright (C) 2014, scenarioo.org Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var fs = require('fs');
var pathSep = require('path').sep;

var directory = module.exports = {};

directory.mkdirSync = function __directory_mkdirSync__(path) {

    var dirs = path.split(pathSep);
    var root = "";

    while (dirs.length > 0) {
        var dir = dirs.shift();
        if (dir === "") {// If directory starts with a /, the first path will be an empty string.
            root = pathSep;
        }
        if (!fs.existsSync(root + dir)) {
            fs.mkdirSync(root + dir);
        }
        root += dir + pathSep;
    }
};

module.exports.mkdir = function __directory_mkdir__(path, callback) {
    var dirs = path.split(pathSep);
    var root = "";

    mkDir();

    function mkDir() {
        var dir = dirs.shift();
        if (dir === "") {// If directory starts with a /, the first path will be an empty string.
            root = pathSep;
        }
        fs.exists(root + dir, function (exists) {
            if (!exists) {
                fs.mkdir(root + dir, function () {
                    root += dir + pathSep;
                    if (dirs.length > 0) {
                        mkDir();
                    } else if (callback) {
                        callback();
                    }
                });
            } else {
                root += dir + pathSep;
                if (dirs.length > 0) {
                    mkDir();
                } else if (callback) {
                    callback();
                }
            }
        });
    }
};