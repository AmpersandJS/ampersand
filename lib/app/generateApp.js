var fs = require('fs-extra');
var slugger = require('slugger');

var TransformStream = require('./transformStream');
var getPackageFile = require('./getPackageFile');
var processString = require('./processString');


/*
{
    framework: 'hapi' || 'express',
    title: 'string',
    machineName: 'string',
    author: 'string',
    folder: 'path string'
}
*/
module.exports = function (options, cb) {
    if (!options.title || !options.projectFolder) {
        throw new Error('title, projectFolder are required');
    }

    // our base config
    var config = {
        framework: 'hapi',
        machineName: slugger(options.title),
        author: '',
        title: '',
        indent: options.indent || 4
    };

    for (var item in options) {
        config[item] = options[item];
    }

    var templateDir = __dirname + '/../../template/';
    fs.copy(templateDir + 'shared', config.projectFolder, {
        transform: function (readable, writeable, file) {
            if (isImageFile(file.name)) {
                readable.pipe(writeable);
            } else {
                var transform = new TransformStream(config);
                readable.pipe(transform).pipe(writeable);
            }
        }
    }, function (err) {
        if (err) return cb(err);
        copyFilesInDir(templateDir + config.framework, config);
        // since we don't have spacemonkey working right for hapi
        if (config.framework === 'hapi') {
            fs.removeSync(config.projectFolder + '/test');
        }
        fs.outputJsonSync(config.projectFolder + '/package.json', getPackageFile(config), {spaces: 2});
        cb();
    });
};

function isImageFile(path) {
    return /\.(jpe?g|gif|png)$/.test(path);
}

function copyFilesInDir(dir, options) {
    fs.readdirSync(dir).forEach(function (filename) {
        var string = fs.readFileSync(dir + '/' + filename, 'utf8');
        // replace our template tags with values
        string = processString(string, options);
        // write it out
        fs.outputFileSync(options.projectFolder + '/' + filename, string);
    });
}
