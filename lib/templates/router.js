var Router = require('ampersand-router');


module.exports = Router.extend({
    routes: {
        '': 'home'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
        // this.trigger('newPage', new HomePage());
    }
});
