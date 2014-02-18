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


// TODO: do correct URL encoding!
// scenarioo expects all filenames to be url encoded ( I guess...). will be displayed human friendly in scenarioo webapp, nevertheless
function getSafeForFileName(inputString) {
    inputString = inputString || "";
    return inputString.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function isDefined(value) {
    return typeof value !== 'undefined';
}

function leadingZeros(n) {
    return ("00" + n).slice(-3);
}

var util = {
    getSafeForFileName: getSafeForFileName,
    isDefined: isDefined,
    leadingZeros: leadingZeros
};

module.exports = util;
