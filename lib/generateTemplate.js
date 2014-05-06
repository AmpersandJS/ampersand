var fs = require('fs');
var path = require('path');
var colors = require('colors');
var fsExtra = require('fs-extra');
var quit = require('./quit');
var readFile = require('./readfilesync');


module.exports = function (config) {
    var type = config._[1];
    var name = config._[2];
    var filePath;
    var file;
    var relPath;

    // allow names with js or not
    if (name && name.indexOf('.js') === -1) {
        name += '.js';
    }

    if (type === 'router') {
        filePath = path.join(config.approot, config.clientfolder, (name || 'router.js'));
    } else if (type === 'model') {
        if (!name) quit('please specify a name: ampersand gen model ' + '${your model name}'.magenta);
        filePath = path.join(config.approot, config.clientfolder, config.modelfolder, name);
    } else if (type === 'view') {
        if (!name) quit('please specify a name: ampersand gen view ' + '${your view name}'.magenta);
        filePath = path.join(config.approot, config.clientfolder, config.viewfolder, name);
    } else if (type === 'page') {
        if (!name) quit('please specify a name: ampersand gen page ' + '${your page name}'.magenta);
        filePath = path.join(config.approot, config.clientfolder, config.pagefolder, name);
    }

    if (filePath) {
        relPath = path.relative(process.cwd(), filePath);
        file = readFile(config[type]);
        if (!file) return quit('no template file found at ' + config[type]);
        if (fs.existsSync(filePath)) return quit('file already exists: ' + (relPath).magenta);
        fsExtra.createFileSync(filePath);
        fs.writeFileSync(filePath, file, 'utf8');
        quit('new ' + (type).magenta + ' created as ' + (relPath).magenta, 0);
    } else {
        quit('no such command');
    }
}
