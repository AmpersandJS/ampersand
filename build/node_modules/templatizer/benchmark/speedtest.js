var colors = require('colors'),
    yetify = require('yetify'),
    fs = require('fs'),
    ich = require('./icanhaz');

// test setup
var data = {users: ['larry', 'curly', 'moe']};
var complexData = {
    users: [{
        name: 'larry',
        url: 'http://andyet.com',
        id: 1
    }, {
        name: 'curly',
        url: 'http://andbang.com',
        id: 2
    }, {
        name: 'moe',
        url: 'http://talky.io',
        id: 3
    }]
};
var ITERATIONS = 100000;
var i = ITERATIONS;

// build our demo file
require('./build-demo');

console.log('\nSetting up templatizer'.bold);
console.log('1.'.grey + ' built: demo_output.js, demo_output_mixins.js');
console.log('2.'.grey + ' now reading in generated files');
var templatesNoMixins = require('../test/demo_output_no_mixins');
var templates = require('../demo_output');

i = ITERATIONS;
console.log('3.'.grey + ' running templatizer version ' + ITERATIONS + ' times.');
console.time('templatizer');
while (i--) templates.users(data);
console.timeEnd('templatizer');

i = ITERATIONS;
console.log('4.'.grey + ' running templatizer complex version ' + ITERATIONS + ' times.');
console.time('templatizer');
while (i--) templates.userscomplex(complexData);
console.timeEnd('templatizer');

i = ITERATIONS;
console.log('5.'.grey + ' running templatizer with standard mixins version ' + ITERATIONS + ' times.');
console.time('templatizer');
while (i--) templatesNoMixins.usersMixins(complexData);
console.timeEnd('templatizer');

i = ITERATIONS;
console.log('4.'.grey + ' running templatizer with altered mixins version ' + ITERATIONS + ' times.');
console.time('templatizer');
while (i--) templates.usersMixins(complexData);
console.timeEnd('templatizer');



console.log('\nSetting up icanhaz'.bold);
ich.addTemplate('users', fs.readFileSync(__dirname + '/users.html', 'utf-8'));
ich.addTemplate('usersComplex', fs.readFileSync(__dirname + '/users.html', 'utf-8'));
console.log('1.'.grey + ' icanhaz added: users.html, users-complex.html');

i = ITERATIONS;
console.time('icanhaz');
console.log('2.'.grey + ' Running ICanHaz version ' + ITERATIONS + ' times.');
while (i--) ich.users(data, true);
console.timeEnd('icanhaz');

i = ITERATIONS;
console.log('3.'.grey + ' Running ICanHaz complex version ' + ITERATIONS + ' times.');
console.time('icanhaz');
while (i--) ich.usersComplex(complexData, true);
console.timeEnd('icanhaz');


console.log('\n\ntemplatizer.js'.bold + ' was made with love by ' + yetify.logo() + ' for you!' + ' <3'.red + '\n');