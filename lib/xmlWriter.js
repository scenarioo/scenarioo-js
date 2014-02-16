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
var path = require('path');
var directory = require('./directory.js');
var js2xmlparser = require("js2xmlparser");


/**
 * resolves the given path (to absolte),
 * generates all directories along the path
 * @param filePath path to a file
 */
function createDirsForFilePath(filePath) {
    directory.mkdirSync(path.dirname(path.resolve(filePath)));
}

function writeXmlFile(rootElement, data, targetFilePath) {

    createDirsForFilePath(targetFilePath);

    fs.writeFile(targetFilePath, js2xmlparser(rootElement, data), 'UTF-8', function (err) {
        if (err) {
            throw err;
        }
    });
    return true;
}

var XmlWriter = {
    writeXmlFile: writeXmlFile
};


module.exports = XmlWriter;