var generateApp = require('./lib/generateApp');


var input = {
    author: 'Henrik Joreteg <henrik@andyet.net>',
    title: 'My Awesome App',
    projectFolder: 'build'
};

generateApp(input, function () {
    console.log(arguments);
});
