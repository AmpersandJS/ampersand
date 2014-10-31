var commander = require('commander');
var chalk = require('chalk');
var generateApp = require('./generateApp');


module.exports = function (config) {
    var appName = (function () {
        if (!config.name) return 'My Amazing App';
        var name = config.name.split(' ')[0];
        name = name.slice(0, 1).toUpperCase() + name.slice(1);
        return name + '\'s Amazing App';
    }());
    var progress = 0;
    var result = {};
    var schema = [
        {
            name: 'projectFolder',
            question: [
                chalk.bold('ampersand.js') + ' - app generator',
                '',
                'This will make a new directory for your app in:',
                chalk.green(process.cwd()),
                '',
                'What do you want to call the folder?'
            ].join('\n'),
            prompt: 'folder name',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            }
        },
        {
            name: 'title',
            question: 'What is the human friendly title of your app? (e.g. ' + appName + ')',
            prompt: 'app title',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        },
        {
            name: 'framework',
            question: [
                'Do you want to use hapi or express as a server framework?'
            ].join('\n'),
            prefill: config.framework || 'hapi',
            prompt: 'hapi or express',
            test: function (answer) {
                // default hapi if not set
                answer = answer ? answer.toLowerCase().trim() : 'hapi';
                if (['hapi', 'express'].indexOf(answer) !== -1) {
                    return answer;
                }
            },
            message: 'Must be \'hapi\' or \'express\''
        },
        {
            name: 'author',
            question: 'What\'s your name? Used to populate "author" field of "package.json"' + chalk.blue('\n\n{\n  "name": "app",\n  "version": "0.0.1",\n  "author": "') + chalk.white('Your answer') + chalk.blue('",\n  "dependencies": ...\n}\n'),
            prompt: 'Author Name',
            prefill: config.name,
            test: function (answer) {
                // try to see if we've got one
                if (!answer) answer = config.name;
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        }
    ];


    function buildQuestion(index) {
        var desc = schema[index];
        var prefill;
        var str;

        // if normal prompt
        if (desc) {
            prefill = (desc.prefill ? '(' + desc.prefill + ')' : '');
            str = '\n' + desc.question + '\n' + chalk.grey(desc.prompt + ': ') + prefill + ' ';
            commander.prompt(str, function (answer) {
                var testedAnswer = desc.test(answer);
                if (typeof testedAnswer === 'string') {
                    result[desc.name] = testedAnswer;
                    progress++;
                } else {
                    console.log(chalk.red('\nerror: ' + desc.message));
                }
                buildQuestion(progress);
            });
        } else {
            // manually remove double quotes from the title since they get templated into code directly
            result.title = result.title.replace('"', '');
            generateApp(result, function (err) {
                if (!err) {
                    console.log('\n\n' + chalk.green(chalk.bold(result.title) + ' was created!\n'));
                    console.log([
                        '',
                        'now cd to it, install dependencies, and run it:',
                        '',
                        chalk.grey('    $ cd ' + result.projectFolder + ' && npm install && npm start'),
                        ''
                    ].join('\n'));
                    process.stdin.destroy();
                } else {
                    console.log(chalk.red('error:'), err);
                }
            });
        }
    }

    buildQuestion(progress);
};
