var fs = require('fs');
var ncp = require('ncp').ncp;
var rimraf = require('rimraf');
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
        title: ''
    };

    for (var item in options) {
        config[item] = options[item];
    }

    ncp(__dirname + '/../template/shared', config.projectFolder, {
        transform: function (readable, writeable, file) {
            var transform = new TransformStream(config);
            readable.pipe(transform).pipe(writeable);
        }
    }, function (err) {
        if (err) return cb(err);
        copyFilesInDir(__dirname + '/../template/' + config.framework, config, config.projectFolder);
        // since we don't have spacemonkey working right for hapi, yet
        if (config.framework === 'hapi') {
            rimraf.sync(config.projectFolder + '/clienttests');
        }
        fs.writeFileSync(config.projectFolder + '/package.json', JSON.stringify(getPackageFile(config), null, 2), {encoding: 'utf8'});
        cb();
    });
}

function copyFilesInDir(dir, options) {
    fs.readdirSync(dir).forEach(function (filename) {
        var string = fs.readFileSync(dir + '/' + filename, {encoding: 'utf8'});
        // replace our template tags with values
        string = processString(string, options);
        // write it out
        fs.writeFileSync(options.projectFolder + "/" + filename, string, {encoding: 'utf8'})
    });
}
