var Hapi = require('hapi');
var config = require('getconfig');
var MoonBootsHapi = require('moonboots_hapi');
var moonbootsConfig = require('./moonbootsConfig');
var fakeApi = require('./fakeApi');
var staticRoutes = require('./staticRoutes');
var internals = {};

var server = new Hapi.Server();
server.connection({ host: config.http.listen, port: config.http.port });

// set clientconfig cookie
internals.configStateConfig = {
    encoding: 'none',
    ttl: 1000 * 60 * 15,
    isSecure: config.isSecure
};
server.state('config', internals.configStateConfig);
internals.clientConfig = JSON.stringify(config.client);
server.ext('onPreResponse', function(request, reply) {
    if (!request.state.config) {
        var response = request.response;
        return reply(response.state('config', encodeURIComponent(internals.clientConfig)));
    }

    return reply.continue();
});

// require moonboots_hapi plugin
server.register([
    {
        register: MoonBootsHapi.register,
        options: moonbootsConfig
    },
    {
        register: fakeApi.register
    },
    {
        register: staticRoutes
    }
], function (err) {
    if (err) throw err;
    // If everything loaded correctly, start the server:
    server.start(function (err) {
        if (err) throw err;
        console.log('{{{title}}} is running at: http://' + config.http.listen + ':' + config.http.port);
    });
});
