/*global me, app*/
var Router = require('ampersand-router');
var HomePage = require('./pages/home');
var CollectionDemo = require('./pages/collection-demo');
var InfoPage = require('./pages/info');
var PersonAddPage = require('./pages/person-add');
var PersonEditPage = require('./pages/person-edit');
var PersonViewPage = require('./pages/person-view');


module.exports = Router.extend({
    routes: {
        '': 'home',
        'collections': 'collectionDemo',
        'info': 'info',
        'person/add': 'personAdd',
        'person/:id': 'personView',
        'person/:id/edit': 'personEdit',
        '(*path)': 'catchAll'
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
    },

    personAdd: function () {
        this.trigger('newPage', new PersonAddPage());
    },

    personEdit: function (id) {
        this.trigger('newPage', new PersonEditPage({
            id: id
        }));
    },

    personView: function (id) {
        this.trigger('newPage', new PersonViewPage({
            id: id
        }));
    },

    catchAll: function () {
        this.redirectTo('');
    }
});
