# moonboots

A set of conventions and tools for building, bundling and serving single page apps with node.js and express.js.

The bulk of the awesome bundling of CommonJS modules for client use is done using [browserify](http://browserify.org/).

This just gives us a structured way to include non-CommonJS libraries, work in development mode and agressively cache built JS and CSS files for production.


## What it does

1. Saves us from re-inventing this process for each app.
1. Let's a developer focus on building a great clientside experience, not boiler plate.
1. Let's you use CommonJS modules to structure your clientside code.
1. Manages clientside files during development so you can just write code.
1. Compiles/minifies/serves uniquely named JS files (and CSS files optionally) containing your application with really aggressive caching (since the name will change if the app does).
1. Plays nicely with [express.js](http://expressjs.com)


## Why?

1. Because single page apps are different. You're shipping an application to be run on the browser instead of running an application to ship a view to the browser.
1. Engineering a good client-side app requires a good set of conventions and structure for organizing your code.
1. Effeciently building/sending a client-side app to the browser is a tricky problem. It's easy to build convoluted solutions. We want something a bit simpler to use.


## How to use it

You grab your moonboots and pass it a config. Then tell express which urls to serve your single page app at. 

That's it.

```js
var express = require('express'),
    Moonboots = require('./index.js'),
    app = express();

// configure our app
var clientApp = new Moonboots({
    main: __dirname + '/sample/app/app.js',
    developmentMode: false,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/styles.css'
    ],
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
app.listen(3000);


```


## Options

Available options that can be passed to Moonboots:

- `main` (required, filepath) - The main entry point of your client app. Browserify uses this build out your dependency tree.
- `server` (optional, connect or express app, default: null) - Highly recommend using this. This way moonboots worries about serving your JS for you in the appropriate format given your other settings.
`developmentMode` (optional, boolean, default: false) - In development mode the JS is recompiled each time it's requested by the browser and it's not minified. Very important this isn't left this way for production. 
- `libraries` (optional, array of file paths, default: []) - An array of paths of JS files to concatenate and include before any CommonJS bundled code. This is useful for stuff like jQuery and jQuery plugins. Note that they will be included in the order specified. So if you're including a jQuery plugin, you'd better be sure that jQuery is listed first. 
- `stylehsheets` (optional, array of file paths, default: []) - An array of CSS files to concatenate
- `jsFileName` (optional, string, default: app) - the name of the JS file that will be built
- `cssFileName` (optional, string, default: styles) - the name of the CSS file that will be built
- `templateFile` (optinal, filepath, default: bundled template): __dirname + '/sample/app.html',
- `cachePeriod` (optional, miliseconds to cache JS file, default: one year in MS)
- `browerify` (optional, object, default: {}) - options to pass directly into browserify's `bundle` methods, as detailed [here](https://github.com/substack/node-browserify#bbundleopts-cb). Additional options are:
  - `browserify.transforms` (optional, list, default: []) - list of transforms to apply to the browserify bundle, see [here](https://github.com/substack/node-browserify#btransformtr) for more details.
- `modulesDir` (optional, directory path, default: '') - directory path of modules to be directly requirable (without using relative require paths). For example if you've got some helper modules that are not on npm but you still want to be able to require directly by name, you can include them here. So you can, for example, put a modified version of backbone in here and still just `require('backbone')`.
- `beforeBuildJS` (optional, function, default: nothing) - function to run before building the browserify bundle during development. This is useful for stuff like compiling clientside templates that need to be included in the bundle. If you specify a callback moonboots will wait for you to call it. If not, it will be run synchrnously (by the magic of Function.prototype.length).
- `beforeBuildCSS` (optional, function, default: nothing) - function to run before concatenating your CSS files during development. This is useful for stuff like generating your CSS files from a preprocessor. If you specify a callback moonboots will wait for you to call it. If not, it will be run synchrnously (by the magic of Function.prototype.length).
- `sourceMaps` (optional, boolean, default: false) - set to true to enable sourcemaps (will only work if developmentMode is also true).
- `resourcePrefix` (optional, string, default: '/') - specify what dirname should be prefixed when generating template file. If you're serving the whole app statically you may need relative paths. So just passing resourcePrefix: '' would make the template render with `<script src="app.js"></script>` instead of `<script src="/app.js"></script>`.
- `minify` (optional, boolean, default: true) An option for whether to minify JS and CSS when not in `developmentMode`.

## About Source Maps

Sourcemaps let you send the actual code to the browser along with a mapping to the individual module files. This makes it easier to debug, since you can get relevant line numbers that correspond to your actual source within your modules instead of the built bundle source.

## Methods

**moonboots.html()** - returns connect request handler that will server the appropriate HTML file with the correct JS file name based on current settings.

**moonboots.js()** - returns connect-compatible request handler that serves the JS file based on settings. If you use the `server` option, this will just be done for you. But you can also do it yourself using this method.

**moonboots.css()** - returns connect-compatible request handler that serves the CSS file based on settings. If you use the `server` option, this will just be done for you. But you can also do it yourself using this method.

**moonboots.jsFileName()** - returns string of the current js filename based on current config. Useful if you want to render your own base html template or if you want to know what the filename is to prime someone's cache while on a login page, etc.

**moonboots.cssFileName()** - returns string of the current css filename based on current config. Useful if you want to render your own base html template or if you want to know what the filename is to prime someone's cache while on a login page, etc.

**moonboots.sourceCode(cb(err, source))** - returns acutal JS source code. Useful if you're using moonboots in dev, but want to put output file somewhere else, for example on a CDN as part of a build process.

**moonboots.cssSource(cb(err, source))** - returns acutal CSS. Useful if you're using moonboots in dev, but want to put output file somewhere else, for example on a CDN as part of a build process.

**moonboots.build(directory, cb)** - builds your `index.html` file and a `.js` and `.css` files to the folder specified.

**moonboots.getTemplate()** - returns a string of the template file with js and css file names replaced


## Full example

For a working example, run `node server.js` file and it'll server the `sample` directory.

## Changelog

**1.0.0**

  - Make CSS build/prepare steps follow same as JS
  - Async css methods

**0.7.0**

  - Support for browserify transforms (thanks @latentflip)
  - Write syntax errors to browser in dev mode (thanks @lukekarrys)

## License

MIT
