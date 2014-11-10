var rimraf = require('rimraf');
var generateApp = require('./lib/app/generateApp');


var input = {
    author: 'Henrik Joreteg <henrik@andyet.net>',
    title: 'My Awesome App',
    projectFolder: 'hapi_build'
};


rimraf('hapi_build', function () {
    rimraf('express_build', function () {
        generateApp(input, function (err) {
            if (err) throw err;
            input.framework = 'express';
            input.projectFolder = 'express_build';
            generateApp(input, function (err) {
                if (err) throw err;
                console.log('done');
            });
        });
    });
});
