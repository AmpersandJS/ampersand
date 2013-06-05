/*global console*/
var express = require('express'),
    connect = require('connect'),
    RedisStore = require('connect-redis')(connect),
    fs = require('fs'),
    helmet = require('helmet'),
    Moonboots = require('moonboots'),
    config = require('getconfig'),
    semiStatic = require('semi-static'),
    request = require('request'),
    gfm = require('github-flavored-markdown'),
    views = require('./views');

// developing without invalid cert complaints is just easier, Proxy will handle https
var app = express();

app.configure(function () {
    app.use(express.compress());
    //app.use(express.static(__dirname + '/clientapp/.build', {maxAge: 86400000 * 360}));
    app.use(express.static(__dirname + '/public'));
    // we only want to expose tests in dev
    if (config.isDev) {
        app.use(express.static(__dirname + '/clienttests/assets'));
        app.use(express.static(__dirname + '/clienttests/spacemonkey'));
    }
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        proxy: true,
        secret: config.session.secret,
        store: new RedisStore({
            host: config.session.host,
            port: config.session.port,
            db: config.session.db
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 90, // 90 days
            secure: config.session.secure
        },
        key: config.session.key
    }));
    // in order to test this with spacemonkey we need frames
    if (!config.isDev) {
        app.use(helmet.xframe());
    }
    app.use(helmet.iexss());
    app.use(helmet.contentTypeOptions());
});

var clientApp = new Moonboots({
    dir: __dirname + '/clientapp',
    developmentMode: true,
    libraries: [
        'zepto.js',
        //'mixpanel.js',
        'init.js'
    ],
    templateFile: __dirname + '/clientApp/index.html',
    server: app
});

// use jade (for now)
app.set('view engine', 'jade');

// public stuff
app.get('/signup', function (req, res) {
    res.redirect(config.oauth.accountsURL + '/signup', 303);
});
app.get('/support', views.render('about/support'));
app.get('/404', views.render('about/404'));
app.get('/500', views.render('about/500'));


// the about mini-site
app.get('/about*', semiStatic({
    folderPath: __dirname + '/views/about',
    root: '/about'
}));

// the help mini-site
app.get('/help*', semiStatic({
    folderPath: __dirname + '/views/help-site',
    root: '/help'
}));

// the test sub site should only be exposed in dev
if (config.isDev) {
    app.get('/test*', semiStatic({
        folderPath: __dirname + '/clienttests',
        root: '/test'
    }));
}

app.get('/markdown/*', function (req, res) {
    var arr = req.url.split('/').slice(2),
        repo = arr.slice(0, 2).join('/'),
        url = arr.join('/');

    request.get('https://raw.github.com/' + url, function (err, response, body) {
        if (body) {
            res.set('Content-Type', 'text/plain').send(gfm.parse(body, repo));
        } else {
            res.send(404, 'not found')
        }
    });
});

var clientSettingsMiddleware = function (req, res, next) {
    res.cookie('config', JSON.stringify(config.client));
    next();
}

app.get('*', clientSettingsMiddleware, clientApp.html());

// listen on the port as specified in our settings
app.listen(config.http.port);
console.log('human.js sample app is running at: http://localhost:' + config.http.port + ' Yep. That\'s pretty awesome.');
