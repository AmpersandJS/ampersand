var Backbone = require('backbone');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'home',
        'one': 'pageOne',
        'two': 'pageTwo'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
        var View = require('pages/home');
        app.renderPage(new View({
            model: me
        }));
    },

    pageOne: function () {
        var View = require('pages/one');
        app.renderPage(new View({
            model: me
        }));
    },

    pageTwo: function () {
        var View = require('pages/two');
        app.renderPage(new View({
            model: me
        }));
    }
});
