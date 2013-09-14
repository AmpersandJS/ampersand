/*global console*/
var express = require('express');
var helmet = require('helmet');
var Moonboots = require('moonboots');
var config = require('getconfig');
var semiStatic = require('semi-static');
var templatizer = require('templatizer');
var app = express();


// -----------------
// Configure express
// -----------------
app.use(express.compress());
app.use(express.static(__dirname + '/public'));
// we only want to expose tests in dev
if (config.isDev) {
    app.use(express.static(__dirname + '/clienttests/assets'));
    app.use(express.static(__dirname + '/clienttests/spacemonkey'));
}
app.use(express.bodyParser());
app.use(express.cookieParser());
// in order to test this with spacemonkey we need frames
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.set('view engine', 'jade');


// ---------------------------------------------------
// Configure Moonboots to serve our client application
// ---------------------------------------------------
var clientApp = new Moonboots({
    jsFileName: '{{{appName}}}',
    cssFileName: '{{{appName}}}',
    main: __dirname + '/clientapp/app.js',
    developmentMode: config.isDev,
    libraries: [
        __dirname + '/clientapp/libraries/zepto.js'
    ],
    stylesheets: [
        __dirname + '/public/css/bootstrap.css',
        __dirname + '/public/css/app.css'
    ],
    browserify: {
        debug: false
    },
    server: app,
    beforeBuild: function () {
        templatizer(__dirname + '/clienttemplates', __dirname + '/clientapp/templates.js');
    }
});


// Set up our little demo API
var api = require('./fakeApi');
app.get('/api/people', api.list);
app.get('/api/people/:id', api.get);
app.delete('/api/people/:id', api.delete);
app.put('/api/people/:id', api.update);
app.post('/api/people', api.add);

// Enable the functional test site in development
if (config.isDev) {
    app.get('/test*', semiStatic({
        folderPath: __dirname + '/clienttests',
        root: '/test'
    }));
}

// use a cookie to send config items to client
var clientSettingsMiddleware = function (req, res, next) {
    res.cookie('config', JSON.stringify(config.client));
    next();
};

// configure our main route that will serve our moonboots app
app.get('*', clientSettingsMiddleware, clientApp.html());

// listen for incoming http requests on the port as specified in our config
app.listen(config.http.port);
console.log('{{{appTitle}}} is running at: http://localhost:' + config.http.port + ' Yep. That\'s pretty awesome.');
