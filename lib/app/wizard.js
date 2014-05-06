var commander = require('commander');
var colors = require('colors');
var generateApp = require('./generateApp');


module.exports = function (config) {
    var appName = function () {
        if (!config.name) return 'My Amazing App';
        var name = config.name.split(' ')[0];
        name = name.slice(0, 1).toUpperCase() + name.slice(1);
        return name + '\'s Amazing App'
    }();
    var progress = 0;
    var result = {};
    var schema = [
        {
            name: 'projectFolder',
            question: [
                'ampersand.js'.bold + ' - app generator',
                '',
                'This will make a new directory for your app in:',
                process.cwd().green,
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
            question: 'What is the human friendly title of your app? (i.e. ' + appName + ')',
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
                var answer = (answer || '').toLowerCase().trim();
                // set our default if not defined
                if (!answer) answer = 'hapi';
                if (['hapi', 'express'].indexOf(answer) !== -1) {
                    return answer;
                }
            },
            message: 'Must be \'hapi\' or \'express\''
        },
        {
            name: 'author',
            question: 'What\'s your name? Used to populate "author" field of "package.json"' + '\n\n{\n  "name": "app",\n  "version": "0.0.1",\n  "author": "'.blue + 'Your answer'.white + '",\n  "dependencies": ...\n}\n'.blue,
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
            str = '\n' + desc.question + '\n' + (desc.prompt + ': ').grey + prefill + ' ';
            commander.prompt(str, function (answer) {
                var testedAnswer = desc.test(answer);
                if (typeof testedAnswer === 'string') {
                    result[desc.name] = testedAnswer;
                    progress++
                } else {
                    console.log(("\nerror: " + desc.message).red);
                }
                buildQuestion(progress);
            });
        } else {
            // manually remove double quotes from the title since they get templated into code directly
            result.title = result.title.replace('"', '');
            generateApp(result, function (err) {
                if (!err) {
                    console.log('\n\n' + (result.title.bold + ' was created!\n').green);
                    console.log([
                        '',
                        'now cd to it, install dependencies, and run it:',
                        '',
                        ('    $ cd ' + result.projectFolder + ' && npm i && npm start').grey,
                        ''
                    ].join('\n'));
                    process.stdin.destroy();
                } else {
                    console.log('error:'.red, err);
                }
            });
        }
    }

    buildQuestion(progress);
};
