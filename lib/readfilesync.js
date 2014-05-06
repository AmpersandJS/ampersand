// dumb, inefficient, synchronous module.
// This is a bad idea, but super useful for things
// where performance isn't a big deal, like in a build
// file or something.

// You can lazily just attempt to read a file path that
// may or may not exist.

// for example:
/*
var readFile = require('readfilesync');

// this won't ever blow up!
var file = readFile('some/path');

// now we can just do
if (!file) {
    // handle case of file not present
}

*/



var fs = require('fs');


module.exports = function (path, encoding) {
    var res;
    try {
        res = fs.readFileSync(path, encoding || 'utf8');
    } catch (e) {}
    return res;
}
