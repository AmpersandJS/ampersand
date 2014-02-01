var Hapi = require('hapi');
var moonboots_options = {
    main: __dirname + '/sample/app/app.js',
    developmentMode: true,
    stylesheets: [
        __dirname + '/sample/stylesheets/style.css'
    ]
};

var server = new Hapi.Server('localhost', 3000);

server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {
        reply('Redirecting to clientside app...').redirect('/app');
    }
});

server.pack.require({ '.': moonboots_options }, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('Sample app running at: http://localhost:3000');
    });
});

