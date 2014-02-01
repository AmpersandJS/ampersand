var fs = require('fs');
var path = require('path');

var existsSync = fs.existsSync || path.existsSync;

var projectPath = path.resolve(__dirname, '../../');
var packagePath = path.join(projectPath, 'package.json');
var projectName = path.basename(projectPath);
var filePath = path.join(__dirname, 'files');
var gitPath = path.join(projectPath, '.git');
var pcPath = path.join(gitPath, 'hooks', 'pre-commit');
var jsiPath = path.join(projectPath, '.jshintignore');
var jsrcPath = path.join(projectPath, '.jshintrc');
var pcModulePath = path.join(projectPath, '../', '.git', 'modules', projectName, 'hooks');


if (existsSync(gitPath)) {
    var stats = fs.lstatSync(path.join(projectPath, '.git'));
    if (stats.isDirectory()) {
        if (existsSync(pcPath)) fs.unlinkSync(pcPath);
        if (!existsSync(path.dirname(pcPath))) fs.mkdirSync(path.dirname(pcPath));
        console.log('Found .git directory, adding pre-commit hook');
        var pcHook = fs.readFileSync(path.join(filePath, 'pre-commit'));
        fs.writeFileSync(pcPath, pcHook);
        fs.chmodSync(pcPath, '755');
    }
} else if (existsSync(pcModulePath)){
    console.log('Found submodule .git directory, adding pre-commit hook');
    var pcHook = fs.readFileSync(path.join(filePath, 'pre-commit'));
    var pcModuleFullPath = path.join(pcModulePath, 'pre-commit');
    fs.writeFileSync(pcModuleFullPath, pcHook);
    fs.chmodSync(pcModuleFullPath, '755');
} else {
    console.error('This project doesn\'t appear to be a git repository. JSHint configuration will be created anyway. To enable the pre-commit hook, run `git init` and reinstall precommit-hook.');
}

if (!existsSync(jsiPath)) {
    console.log('Did not find a .jshintignore, creating one');
    var jsiFile = fs.readFileSync(path.join(filePath, 'jshintignore'));
    fs.writeFileSync(jsiPath, jsiFile);
}

if (!existsSync(jsrcPath) && (!existsSync(packagePath) || !require(packagePath).hasOwnProperty('jshintConfig'))) {
    console.log('Did not find a .jshintrc and package.json does not contain jshintConfig, creating .jshintrc');
    var jsrcFile = fs.readFileSync(path.join(filePath, 'jshintrc'));
    fs.writeFileSync(jsrcPath, jsrcFile);
}
