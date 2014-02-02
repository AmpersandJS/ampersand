/*global me, app*/
var Backbone = require('backbone');
var HomePage = require('./pages/home');
var CollectionDemo = require('./pages/collectionDemo');
var InfoPage = require('./pages/info');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'home',
        'collections': 'collectionDemo',
        'info': 'info'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
        this.trigger('newPage', new HomePage({
            model: me
        }));
    },

    collectionDemo: function () {
        this.trigger('newPage', new CollectionDemo({
            model: me,
            collection: app.people
        }));
    },

    info: function () {
        this.trigger('newPage', new InfoPage({
            model: me
        }));
    }
});
