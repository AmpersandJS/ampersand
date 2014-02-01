var express = require('express'),
    Moonboots = require('./index.js'),
    app = express();

// configure our app
var clientApp = new Moonboots({
    main: __dirname + '/sample/app/app.js',
    templateFile: __dirname + '/sample/app.html',
    developmentMode: true,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/sample/stylesheets/style.css'
    ],
    beforeBuildCSS: function () {
        console.log('Building CSS');
    },
    beforeBuildJS: function () {
        console.log('Building JS');
    },
    server: app
});

// if we want to prime the user's cache with the
// application files. The login page is a great place
// to do this. We can retrieve the name of the
// JS file for the current app, by calling module's
// jsFileName() function.
app.get('/login', function (req, res) {
    // then in our login page we can lazy load the application to
    // prime the user's cache while they're typing in their username/password
    res.render('login', {appFileName: clientApp.jsFileName()});
});

// We also just need to specify the routes at which we want to serve this clientside app.
// This is important for supporting "deep linking" into a single page app. The server
// has to know what urls to let the browser app handle.
app.get('*', clientApp.html());

// start listening for http requests
app.listen(3000, function () {
    console.log('Sample app started at localhost:3000');
});


