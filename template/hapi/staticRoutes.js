exports.name = 'static_routes';
exports.version = '0.0.0';
exports.register = function (plugin, options, next) {        
    // Tell Hapi to handle the public folder as a file directory
    plugin.route({ 
        method: 'GET',
        path: '/public/{param*}',
        handler: {directory: {path: 'public'}}
    });

    // We expect this file to be availiable from the root of our web app
    plugin.route({
        method: 'get',
        path: '/robots.txt',
        handler: {file: {path: 'public/robots.txt'}}
    });

    next();
};