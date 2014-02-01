var fs = require('fs');
var crypto = require('crypto');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var browserify = require('browserify');
var UglifyJS = require('uglify-js');
var cssmin = require('cssmin');
var path = require('path');


function Moonboots(opts) {
    var self = this;
    // we'll calculate this to know whether to change the filename
    var jssha = crypto.createHash('sha1');
    var csssha = crypto.createHash('sha1');
    var item;

    // inherit
    EventEmitter.call(this);

    if (!opts.main) {
        throw new Error("You must supply at minimum a `main` file for your moonboots app: {main: 'myApp.js'}");
    }

    this.config = {
        server: '',
        developmentMode: false,
        libraries: [],
        stylesheets: [],
        templateFile: '',
        jsFileName: 'app',
        cssFileName: 'styles',
        cachePeriod: 86400000 * 360, // one year,
        browserify: {}, // overridable browerify options
        modulesDir: '',
        beforeBuildJS: function (cb) { cb(); },
        beforeBuildCSS: function (cb) { cb(); },
        sourceMaps: false,
        resourcePrefix: '/',
        minify: true,
    };

    // Were we'll store generated
    // source code, etc.
    this.result = {
        js: {
            fileName: '',
            minFileName: '',
            source: '',
            min: '',
            checkSum: '',
        },
        css: {
            fileName: '',
            minFileName: '',
            source: '',
            min: '',
            checkSum: ''
        },
        error: '',
        html: '',
        libs: ''
    };

    if (typeof opts === 'object') {
        for (item in opts) {
            this.config[item] = opts[item];
        }
    }

    // make sourcemaps a simple top-level option that only works
    // in development mode.
    if (this.config.sourceMaps && this.config.developmentMode) {
        this.config.browserify.debug = true;
    }

    // register handler for serving JS
    if (opts.server) {
        opts.server.get('/' + encodeURIComponent(this.config.jsFileName) + '*.js', this.js());
        opts.server.get('/' + encodeURIComponent(this.config.cssFileName) + '*.css', this.css());
    }

    this._concatExternalLibraries();

    async.parallel([
        // CSS
        function (cb) {
            async.series([
                function (_cb) {
                    self.prepareCSSBundle(_cb);
                },
                function (_cb) {
                    var cssCheckSum;
                    // create our hash and build filenames accordingly
                    csssha.update(self.result.css.source);
                    cssCheckSum = self.result.css.checkSum = csssha.digest('hex').slice(0, 8);

                    // store filenames
                    self.result.css.fileName = self.config.cssFileName + '.' + cssCheckSum + '.css';
                    self.result.css.minFileName = self.config.cssFileName + '.' + cssCheckSum + '.min.css';

                    if (self._shouldMinify()) {
                        self.result.css.min = cssmin(self.result.css.source);
                    }

                    _cb();
                }
            ], function (err) {
                if (err) self._bundleError(err);
                cb();
            });
        },
        // JS
        function (cb) {
            async.series([
                function (_cb) {
                    self.prepareBundle(_cb);
                },
                function (_cb) {
                    var jsCheckSum;
                    // create our hash and build filenames accordingly
                    jssha.update(self.result.js.source);
                    jsCheckSum = self.result.js.checkSum = jssha.digest('hex').slice(0, 8);

                    // store filenames
                    self.result.js.fileName = self.config.jsFileName + '.' + jsCheckSum + '.js';
                    self.result.js.minFileName = self.config.jsFileName + '.' + jsCheckSum + '.min.js';

                    if (self._shouldMinify()) {
                        self.result.js.min = UglifyJS.minify(self.result.js.source, {fromString: true}).code;
                    }

                    _cb();
                }
            ], function (err) {
                if (err) self._bundleError(err);
                cb();
            });
        }
    ], function () {
        self.result.html = self.getTemplate();
        self.ready = true;
        self.emit('ready');
    });
}

// Inherit from event emitter
Moonboots.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: Moonboots
    }
});

// Shows stack in browser instead of just blowing up on the server
Moonboots.prototype._bundleError = function (err) {
    if (!this.config.developmentMode) throw err;
    var trace;
    if (err.stack) {
        trace = err.stack;
    } else if (typeof err === 'string') {
        trace = err;
    } else {
        trace = JSON.stringify(err);
    }
    console.error(trace);
    this.result.error = 'document.write("<pre style=\'background:#ECFOF2; color:#444; padding: 20px\' >' + trace.split('\n').join('<br>').replace(/"/g, '&quot;') + '</pre>");';
};

// Returns contactenated external libraries
Moonboots.prototype._concatExternalLibraries = function () {
    var cache = this.result;
    return cache.libs || (cache.libs = concatFiles(this.config.libraries));
};

// Helper for preparing either JS or CSS bundle
Moonboots.prototype._prepare = function (type, cb) {
    // Aliasing beforeBuild to beforeBuildJS
    var beforeBuildJSName = this.config.beforeBuild ? 'beforeBuild' : 'beforeBuildJS',
        beforeName = type === 'css' ? 'beforeBuildCSS' : beforeBuildJSName,
        before = this.config[beforeName];

    // if they pass a callback, wait for it
    if (before.length) {
        before(cb);
    } else {
        before();
        cb();
    }
};

// Actually generate the JS bundle
Moonboots.prototype.prepareBundle = function (cb) {
    var self = this;
    this._prepare('js', function (err) {
        if (err) return cb(err);

        self.bundle = browserify();

        // handle module folder that you want to be able to require
        // without relative paths.
        if (self.config.modulesDir) {
            var modules = fs.readdirSync(self.config.modulesDir);
            modules.forEach(function (moduleFileName) {
                if (path.extname(moduleFileName) === '.js') {
                    self.bundle.require(self.config.modulesDir + '/' + moduleFileName, {expose: path.basename(moduleFileName, '.js')});
                }
            });
        }

        // handle browserify transforms if passed
        if (self.config.browserify.transforms) {
            self.config.browserify.transforms.forEach(function (tr) {
                self.bundle.transform(tr);
            });
        }

        // add main import
        self.bundle.add(self.config.main);

        // run main bundle function
        self.bundle.bundle(self.config.browserify, function (err, js) {
            if (err) return cb(err);

            self.result.js.source = self.result.libs + js;
            if (cb) cb(null, self.result.js.source);
        });
    });
};

// Actually prepare CSS bundle
Moonboots.prototype.prepareCSSBundle = function (cb) {
    var self = this;
    this._prepare('css', function (err) {
        if (err) return cb(err);

        var css = concatFiles(self.config.stylesheets);
        self.result.css.source = css;
        cb(null, self.result.css.source);
    });
};

// util for making sure files are built before trying to
// serve them
Moonboots.prototype._ensureReady = function (cb) {
    if (this.ready) {
        cb();
    } else {
        this.on('ready', cb);
    }
};

// Helper to determine if minification should happen
Moonboots.prototype._shouldMinify = function () {
    return this.config.minify && !this.config.developmentMode;
};

// Returns request handler to serve html
Moonboots.prototype.html = function () {
    var self = this;
    return function (req, res) {
        self._ensureReady(function () {
            res.set('Content-Type', 'text/html; charset=utf-8').send(self.result.html);
        });
    };
};

// Returns request handler for serving JS file
// minified, if appropriate.
Moonboots.prototype.js = function () {
    return this._responseHandler('js');
};

// returns request handler for serving CSS file
// minified, if appropriate.
Moonboots.prototype.css = function () {
    return this._responseHandler('css');
};

Moonboots.prototype._responseHandler = function (type) {
    var self = this;
    return function (req, res) {
        self.result.error = ''; // Reset errors on file requests
        self._ensureReady(function () {
            self._sendSource(type, function (err, source) {
                if (self.result.error && type === 'js') {
                    // If we have an error (from CSS or JS)
                    // and this is our JS handler then return with only our error
                    // so we can display it in the browser
                    source = self.result.error;
                }
                var contentType = 'text/' + (type === 'css' ? type : 'javascript') + '; charset=utf-8';
                res.set('Content-Type', contentType);
                    // set our far-future cache headers if not in dev mode
                if (!self.config.developmentMode) {
                    res.set('Cache-Control', 'public, max-age=' + self.config.cachePeriod);
                }
                res.send(source);
            });
        });
    };
};

// Returns with source code for CSS or JS
// minified, if appropriate
Moonboots.prototype._sendSource = function (type, cb) {
    var self = this,
        result = self.result[type],
        prepare = type === 'css' ? self.prepareCSSBundle : self.prepareBundle,
        config = self.config;

    if (config.developmentMode) {
        prepare.call(self, function (err, source) {
            // If we have an error, then make it into a JS string
            if (err) self._bundleError(err);
            cb(err, source);
        });
    } else if (config.minify) {
        cb(null, result.min);
    } else {
        cb(null, result.source);
    }
};

//Legacy method to get JS sourcecode
Moonboots.prototype.sourceCode = function (cb) {
    this.jsSource(cb);
};

// Returns with the JS sourcecode
// minified, if appropriate
Moonboots.prototype.jsSource = function (cb) {
    this._sendSource('js', cb);
};

// Returns with the CSS sourcecode
// minified, if appropriate
Moonboots.prototype.cssSource = function (cb) {
    this._sendSource('css', cb);
};

// returns the filename of the currently built CSS or JS file based on
// development and minification settings.
Moonboots.prototype._filename = function (type) {
    var result = this.result[type],
        configFileName = type === 'css' ? this.config.cssFileName : this.config.jsFileName;
    if (this.config.developmentMode) {
        return configFileName + '.' + type;
    } else {
        return this.config.minify ? result.minFileName : result.fileName;
    }
};

// returns the filename of the currently built JS file based on
// development and minification settings.
Moonboots.prototype.jsFileName = function () {
    return this._filename('js');
};

// returns the filename of the currently built CSS file based on
// development and minification settings.
Moonboots.prototype.cssFileName = function () {
    return this._filename('css');
};

// Main template fetcher. Will look for passed file and settings
// or build default template.
Moonboots.prototype.getTemplate = function () {
    var templateString = '';
    var prefix = this.config.resourcePrefix;
    if (this.config.templateFile) {
        templateString = fs.readFileSync(this.config.templateFile, 'utf-8');
        templateString = templateString
            .replace('#{jsFileName}', prefix + this.jsFileName())
            .replace('#{cssFileName}', prefix + this.cssFileName());
    } else {
        templateString = this._defaultTemplate();
    }
    return templateString;
};

// If no custom template is specified use a standard one.
Moonboots.prototype._defaultTemplate = function () {
    var string = '<!DOCTYPE html>\n';
    var prefix = this.config.resourcePrefix;
    if (this.result.css.source) {
        string += linkTag(prefix + this.cssFileName());
    }
    string += scriptTag(prefix + this.jsFileName());
    return this.result.html = string;
};

// Build kicks out your app HTML, JS, and CSS into a folder you specify.
Moonboots.prototype.build = function (folder, callback) {
    var self = this;
    async.parallel([
        function (cb) {
            self.sourceCode(function (err, source) {
                if (err) return cb(err);
                fs.writeFile(path.join(folder, self.jsFileName()), source, cb);
            });
        },
        function (cb) {
            self.cssSource(function (err, source) {
                if (err) return cb(err);
                fs.writeFile(path.join(folder, self.cssFileName()), source, cb);
            });
        },
        function (cb) {
            fs.writeFile(path.join(folder, 'index.html'), self.getTemplate(), cb);
        }
    ], callback);
};

// Non-express servers need config items like cachePeriod
Moonboots.prototype.getConfig = function (key) {
    var self = this;
    if (typeof key === 'string') {
        return this.config[key];
    }
    return this.config;
};

Moonboots.prototype.getResult = function(key, cb) {
    var self = this;
    self._ensureReady(function () {
      if (typeof key === 'string') {
        return cb(null, self.result[key]);
      }
      return cb(null, self.result);
    });
};

// Main export
module.exports = Moonboots;


// a few helpers
function concatFiles(arrayOfFiles) {
    return (arrayOfFiles || []).reduce(function (result, fileName) {
        return result + fs.readFileSync(fileName) + '\n';
    }, '');
}

function linkTag(filename) {
    return '<link href="' + filename + '" rel="stylesheet" type="text/css">\n';
}

function scriptTag(filename) {
    return '<script src="' + filename + '"></script>';
}
