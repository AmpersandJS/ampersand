// # Super Simple Demo

// we start with express
var express = require('express');

// We require semi-static .
// in your code it'd just be require('semi-static') but we
// reference it relatively to pull the one from this repo
var semiStatic = require('../../semi-static');

// init our app
var app = express();

// Serve our static files (css, js, images, etc.)
// semi-static doesn't do this for us.
app.use(express.static(__dirname + '/public'));

// Tell express to use jade
app.set('view engine', 'jade');

// If you're using express out of the box, you can just
// do this. And it will assume you put your jade files
// into 'views/static' and will look for an 'index.jade' file.
app.get('*', semiStatic());

// You can optionally configure other semi-static "microsites"
// alongside in any folder you want.
//
// The following will make the templates inside the 'helpsite'
// folder into a semi-static site available at 'example.com/help'
app.get('/help*', semiStatic({
    folderPath: __dirname + '/helpsite',
    root: '/help'
}));

// we can still have a normal 404 at the end
// because it will only do something if there's
// a path that matches.
app.all('*', function (req, res) {
    res.send('not found', 404);
});

app.listen(3000);
console.log('started');
