var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var fsExtra = require('fs-extra');
var quit = require('./quit');
var stdin = require('./helpers/stdin');
var readFile = require('./readfilesync');
var processTemplate = require('./helpers/process-template');
var clean = require('./helpers/clean');
var genTypes = require('./gen-types');


module.exports = function (config) {
    var type = config._[1];
    var name = config._[2];
    var filePath;
    var folderPath;
    var file;
    var fileName;

    // allow names with js or not
    if (name && name.indexOf('.js') === -1) {
        fileName = name + '.js';
    } else {
        fileName = name;
    }

    if (type === 'router') {
        folderPath = path.join(config.approot, config.clientfolder);
        filePath = path.join(folderPath, (fileName || 'router.js'));
    } else if (type === 'model') {
        if (!name) quit('please specify a name: ampersand gen model ' + chalk.magenta('${your model name}'));
        folderPath = path.join(config.approot, config.clientfolder, config.modelfolder);
        filePath = path.join(folderPath, fileName);
    } else if (type === 'view') {
        if (!name) quit('please specify a name: ampersand gen view ' + chalk.magenta('${your view name}'));
        folderPath = path.join(config.approot, config.clientfolder, config.viewfolder);
        filePath = path.join(folderPath, fileName);
    } else if (type === 'page') {
        if (!name) quit('please specify a name: ampersand gen page ' + chalk.magenta('${your page name}'));
        folderPath = path.join(config.approot, config.clientfolder, config.pagefolder);
        filePath = path.join(folderPath, fileName);
    } else if (type === 'form') {
        if (!name) quit('please specify a path to the model: ampersand gen form ' + chalk.magenta('${path to model}'));
        folderPath = path.join(config.approot, config.clientfolder, config.formsfolder);
        filePath = path.join(folderPath, path.basename(fileName));
    }

    if (name) {
        config.folderPath = folderPath;
        config.relPath = path.relative(process.cwd(), filePath);
        if (!config.force && fs.existsSync(filePath)) return quit('file already exists at: ' +  chalk.magenta(config.relPath) + ' add ' + chalk.magenta('-f') + ' to force');
        stdin(function (input) {
            if (input) {
                config.data = input;
            }
            if (type === 'model') {
                config.name = name;
                genTypes.model(config, function (err, result) {
                    var modelFilePath = path.join(config.folderPath, result.modelFileName);
                    var collectionFilePath = path.join(config.folderPath, result.collectionFileName);
                    fsExtra.createFileSync(modelFilePath);
                    fs.writeFileSync(modelFilePath, clean(result.model, config), 'utf8');
                    console.log('\nnew ' + chalk.magenta('Model') + ' created as ' + chalk.magenta(path.relative(process.cwd(), modelFilePath)));
                    if (config.makecollection) {
                        fsExtra.createFileSync(collectionFilePath);
                        fs.writeFileSync(collectionFilePath, clean(result.collection, config), 'utf8');
                        console.log('new ' + chalk.magenta('Collection') + ' for ' + chalk.magenta(name) + ' created as ' + chalk.magenta(path.relative(process.cwd(), collectionFilePath)));
                    }
                    console.log('');
                    quit();
                });
            } else if (type === 'form') {
                genTypes.form({modelpath: name}, function (err, code) {
                    fsExtra.createFileSync(filePath);
                    fs.writeFileSync(filePath, clean(code, config), 'utf8');
                    quit('new ' + chalk.magenta('Form') + ' for ' + chalk.magenta(path.basename(fileName)) + ' created as ' + chalk.magenta(path.relative(process.cwd(), filePath)));
                });
            } else {
                file = readFile(config[type]);
                if (!file) return quit('no template file found at ' + config[type]);
                fsExtra.createFileSync(filePath);
                file = clean(processTemplate(file, config), config);
                fs.writeFileSync(filePath, file, 'utf8');
                quit('new ' + chalk.magenta(type) + ' created as ' + chalk.magenta(config.relPath), 0);
            }
        });
    } else {
        quit('no such command');
    }
};
