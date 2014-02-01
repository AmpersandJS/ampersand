# moonboots_hapi

Moonboots plugin that allows it to serve files using a hapi server.
Be sure to use hapi 2.x (won't work on 1.x, see legacy branch for 1.x)

## How to use:

Exactly like you would expect, except it's a plugin now (which means it
registers the catchall route itself).  Also you don't pass in a server
parameter.

```js
var Hapi = require('hapi');

var moonboots_config = {
    main: __dirname + '/sample/app/app.js',
    developmentMode: false,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/styles.css'
    ]
};

var server = new Hapi.Server();

server.pack.require({moonboots_hapi: moonboots_config}, function (er) {
    server.start();
});
```

## Additional options

If your app has something like auth you can pass in a hapi parameter to
the moonboots config and it will be added to the _config_ portion of the
client app request handler

The app by default will serve on all requests unless you pass in an
_appPath_ option

js and css paths will default to _appPath_ if it is defined, and will
default to _app.js_ and _app.css_ respectively otherwise.

```js
var Hapi = require('hapi');
var HapiSession = require('hapi-session');

var moonboots_config = {
    main: __dirname + '/sample/app/app.js',
    developmentMode: false,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/styles.css'
    ],
    hapi: {
        auth: 'session',
    },
    appPath: '/app'
};

var server = new Hapi.Server();
server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {
        reply().redirect('/app');
    }
});
server.auth('session', {
    implementation: new HapiSession(server, session_options)
});

server.pack.require({moonboots_hapi: moonboots_config}, function (err) {
    server.start();
});
```

## Multiple mooonboots on one server

You can register multiple moonboots apps for a single hapi server like so:

1. Pass in an array of moonboots configs instead of a single config.
2. Make sure that each config provides unique `appPath` or hapi will complain that the paths conflict.

Example of registering multiple apps:

```js
server.pack.require({moonboots_hapi: [moonboots_config1, moonboots_config2]}, function (er) {
    server.start();
});
```

## Helpers

There are currently two methods exposed from the plugin

```js
server.plugins['moonboots_hapi].getMoonbootsConfigs(function (configs) {
    console.log(configs); //Will be all moonboots configs
});
server.plugins['moonboots_hapi].getMoonbootsApp(0, function (config) {
    console.log(config); //Will be the first moonboots config
});
```

## Test

Run `npm test`

## Sample

Run `npm start` and make sure you have a grey (#ccc) background and the
"Woo! View source to see what rendered me" message in your window.

#License

MIT
