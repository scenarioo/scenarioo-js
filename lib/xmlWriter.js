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