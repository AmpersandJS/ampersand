var Moonboots = require('moonboots');
var async = require('async');

function setDefaults(options, next) {
    var baseAppPath;
    if (!options.appPath) {
        options.appPath = '/{client*}';
    }
    baseAppPath = options.appPath.replace(/\/{.*}$/, '').slice(1);
    if (!baseAppPath) {
        baseAppPath = 'app';
    }

    if (!options.jsFileName) {
        options.jsFileName = baseAppPath;
    }
    if (!options.cssFileName) {
        options.cssFileName = baseAppPath;
    }
    return options;
}

exports.register = function (plugin, options, next) {
    var HapiError = plugin.hapi.Error;
    var clientConfigs = (options instanceof Array) ? options : [options];

    async.forEach(clientConfigs, function _eachApp(options, cb) {
        var clientApp = new Moonboots(setDefaults(options));
        var appRouteConfig = clientApp.getConfig('hapi') || {};
        appRouteConfig.description = appRouteConfig.description || 'Main Moonboots app';
        appRouteConfig.notes = appRouteConfig.notes || 'Returns the compiled Moonboots app';
        appRouteConfig.tags = appRouteConfig.tags || ['moonboots', 'app'];
        var jsRouteConfig = {
            description: 'Moonboots JS source',
            notes: 'Returns the compiled JS from moonboots',
            tags: ['moonboots', 'js']
        };
        var cssRouteConfig = {
            description: 'Moonboots CSS source',
            notes: 'Returns the compiled CSS from moonboots',
            tags: ['moonboots', 'css']
        };
        if (!clientApp.getConfig('developmentMode')) {
            jsRouteConfig.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
            cssRouteConfig.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
            appRouteConfig.cache = appRouteConfig.cache || {};
            appRouteConfig.cache.expiresIn = clientApp.getConfig('cachePeriod');
        }
        jsRouteConfig.handler = function jsRouteHandler(request, reply) {
            clientApp.jsSource(function _getJsSource(err, css) {
                if (err) {
                    return reply(new HapiError.internal('No js source'));
                }
                reply(css).header('content-type', 'text/javascript; charset=utf-8');
            });
        };
        cssRouteConfig.handler = function cssRouteHandler(request, reply) {
            clientApp.cssSource(function _getCssSource(err, css) {
                if (err) {
                    return reply(new HapiError.internal('No css source'));
                }
                reply(css).header('content-type', 'text/css; charset=utf-8');
            });
        };
        appRouteConfig.handler = function appRouteHandler(request, reply) {
            clientApp.getResult('html', function _getHtmlResult(err, html) {
                if (err) {
                    return reply(new HapiError.internal('No html result'));
                }
                reply(html);
            });
        },
        clientApp.on('ready', function _clientAppReady() {
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.jsFileName()),
                config: jsRouteConfig
            });
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                config: cssRouteConfig
            });
            plugin.route({
                method: 'get',
                path: clientApp.getConfig('appPath'),
                config: appRouteConfig
            });
            cb();
        });
    }, function () {
        // expose all apps to other handlers
        plugin.expose('getMoonbootsConfig', function (i, cb) {
            return cb(clientConfigs[i]);
        });
        plugin.expose('getMoonbootsConfigs', function (cb) {
            return cb(clientConfigs);
        });
        next();
    });
};
