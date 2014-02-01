/* Test that the routes return expected data */
var server, appSource1, jsSource1, cssSource1, appSource2, jsSource2, cssSource2;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');

var moonboots_options1 = {
    appPath: '/app1',
    jsFileName: 'moonboots-hapi-js1',
    cssFileName: 'moonboots-hapi-css1',
    main: __dirname + '/../sample/app/app.js',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var moonboots_options2 = {
    appPath: '/app2',
    jsFileName: 'moonboots-hapi-js2',
    cssFileName: 'moonboots-hapi-css2',
    main: __dirname + '/../sample/app/app.js',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var moonboots1 = new Moonboots(moonboots_options1);
var moonboots2 = new Moonboots(moonboots_options2);

module.exports = {
    setUp: function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.require({ '..': [moonboots_options1, moonboots_options2] }, next);
            },
            getSource: function (next) {
                moonboots1.getResult('html', function _getSource(err, html) {
                    appSource1 = html;
                    next(err);
                });
            },
            getSource2: function (next) {
                moonboots2.getResult('html', function _getSource(err, html) {
                    appSource2 = html;
                    next(err);
                });
            },
            getJs: function (next) {
                moonboots1.jsSource(function _getJsSource(err, js) {
                    jsSource1 = js;
                    next(err);
                });
            },
            getJs2: function (next) {
                moonboots2.jsSource(function _getJsSource(err, js) {
                    jsSource2 = js;
                    next(err);
                });
            },
            getCss: function (next) {
                moonboots1.cssSource(function _getCssSource(err, css) {
                    cssSource1 = css;
                    next(err);
                });
            },
            getCss2: function (next) {
                moonboots2.cssSource(function _getCssSource(err, css) {
                    cssSource2 = css;
                    next(err);
                });
            }
        }, function (err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    },
    tearDown: function (next) {
        next();
    },
    app: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/app1'
        }, function _getApp(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, appSource1);
            test.done();
        });
    },
    app2: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/app2'
        }, function _getApp(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, appSource2);
            test.done();
        });
    },
    js: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js1.js'
        }, function _getJs(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, jsSource1);
            test.done();
        });
    },
    js2: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js2.js'
        }, function _getJs(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, jsSource2);
            test.done();
        });
    },
    css: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css1.css'
        }, function _getJs(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, cssSource1);
            test.done();
        });
    },
    css2: function (test) {
        test.expect(2);
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css2.css'
        }, function _getJs(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, cssSource2);
            test.done();
        });
    },
    getMoonbootsConfig1: function (test) {
        test.expect(1);
        server.plugins.moonboots_hapi.getMoonbootsConfig(0, function (config) {
            test.equal(config, moonboots_options1);
            test.done();
        });
    },
    getMoonbootsConfig2: function (test) {
        test.expect(1);
        server.plugins.moonboots_hapi.getMoonbootsConfig(1, function (config) {
            test.equal(config, moonboots_options2);
            test.done();
        });
    }
};
