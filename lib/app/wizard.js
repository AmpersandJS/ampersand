var inquirer = require('inquirer');
var chalk = require('chalk');
var generateApp = require('./generateApp');
var _ = require('lodash')


module.exports = function (config) {
    var appName = 'My Amazing App';
    if (config.name) {
        var name = config.name.split(' ')[0];
        name = name.slice(0, 1).toUpperCase() + name.slice(1);
        appName = name + '\'s Amazing App';
    }

    function required(value) {
        return !!value.trim() || 'Required';
    }

    console.log([
        chalk.bold('ampersand.js') + ' - app generator',
        '',
        'This will make a new directory for your app in:',
        chalk.magenta(process.cwd()),
        '',
    ].join('\n'));

    var questions = [
        {
            name: 'projectFolder',
            message: 'What do you want to call the folder?',
            validate: required
        },
        {
            name: 'title',
            message: 'What is the human friendly title of your app?',
            default: appName,
            filter: function (value) {
                return value.replace('"', '');
            },
            validate: required
        },
        {
            type: 'list',
            name: 'framework',
            message: 'Do you want to use hapi or express as a server framework?',
            default: config.framework || 'hapi',
            choices: ['hapi', 'express']
        },
        {
            name: 'author',
            message: [
                'What\'s your name? Used to populate "author" field of "package.json", as:',
                '',
                chalk.grey('{'),
                chalk.grey('  "name": "app",'),
                chalk.grey('  "version": "0.0.1",'),
                chalk.grey('  "author": "' + chalk.magenta('Your answer') + '",'),
                chalk.grey('  "dependencies": ...'),
                chalk.grey('}'),
                '',
                chalk.white('Author Name:')
            ].join('\n'),
            default: config.name,
            validate: required
        }
    ];

    inquirer.prompt(questions, function (answers) {
        generateApp(_.assign(config, answers), function (err) {
            if (err) return console.log(chalk.red('error:'), err);
            console.log([
                chalk.magenta(chalk.bold(answers.title) + ' was created!'),
                'now cd to it, install dependencies, and run it:',
                chalk.grey('    $ cd ' + answers.projectFolder + ' && npm install && npm start'),
                ''
            ].join('\n\n'));
            process.stdin.destroy();
        });
    });
};
