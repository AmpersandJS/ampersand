var app = require('ampersand-app');
var _ = require('underscore');
var logger = require('andlog');
var config = require('clientconfig');

var Router = require('./router');
var tracking = require('./helpers/metrics');
var MainView = require('./views/main');
var Me = require('./models/me');
var People = require('./models/persons');
var domReady = require('domready');


module.exports = {
    // this is the the whole app initter
    blastoff: function() {
        app.extend({

            // create the global 'me' object and an empty collection for our people models
            me: new Me(),
            users: new People(),

            // init our URL handlers and the history tracker
            router: new Router(),

            // This is how you navigate around the app.
            // this gets called by a global click handler that handles
            // all the <a> tags in the app.
            // it expects a url without a leading slash.
            // for example: "costello/settings".
            navigate: function(page) {
                var url = (page.charAt(0) === '/') ? page.slice(1) : page;
                this.router.history.navigate(url, {
                    trigger: true
                });
            }
        });

        // wait for document ready to render our main view
        // this ensures the document has a body, etc.
        domReady(function() {
            // init the main view
            var mainView = app.view = new MainView({
                model: app.me,
                el: document.body
            });

            // ...and render it
            mainView.render();

            // we have what we need, now start the router and show the appropriate page
            app.router.history.start({
                pushState: true,
                root: '/'
            });
        });
    }
};

// run it
module.exports.blastoff();
