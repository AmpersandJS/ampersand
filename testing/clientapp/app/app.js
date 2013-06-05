/*global window SoundMachine NotificationMachine app me */
var MainView = require('views/main'),
    stats = require('loading-stats'),
    Strict = require('strictmodel'),
    Backbone = require('backbone'),
    _ = require('underscore'),
    Router = require('router'),
    logger = require('andlog'),
    async = require('async'),
    tracking = require('helpers/metrics'),
    Me = require('models/me'),
    config = require('clientconfig'),
    SoundEffectManager = require('sound-effect-manager');


module.exports = {
    // this is the the whole app initter
    blastoff: function (spec) {
        // add the ability to bind/unbind/trigger events
        // to the main app object.
        _.extend(this, Backbone.Events);

        var self = window.app = this;

        window.me = new Me();

        // init our URL handlers and the history tracker
        this.router = new Router();
        this.history = Backbone.history;

        // init our main view
        this.view = new MainView({model: me});

        // init and configure our sound effects module
        this.sm = new SoundEffectManager();

        // we have what we need, we can now start our router and show the appropriate page
        Backbone.history.start({pushState: true, root: '/'});

        // mark us are "ready" this covers events coming from the API that cause
        // errors because the values used to look up models don't yet exist.
        self.ready = true;

        // start loading sounds
        //app.loadSounds();


        return this;
    },
    loadSounds: function () {
        var self = this,
            sounds = [
                ['rocket.mp3', 'rocket'],
                ['AB06-activate-01.mp3', 'activate'],
                ['AB06-deactivate-01.mp3', 'deactivate'],
                ['AB06-dragndrop_task.mp3', 'delegate'],
                ['AB06-new_task.mp3', 'newTask'],
                ['AB06-receive_mentioned_B2.mp3', 'mentioned'],
                ['AB06-task_received.mp3', 'taskReceived']
            ];
        // gradually load our sounds
        sounds.forEach(function (sound, index) {
            app.jobs.push(function (cb) {
                self.sm.loadFile('/sounds/' + sound[0], sound[1], 0, cb);
            });
        });
    },
    // returns any model based on it's server ID.
    getModel: function (type, id, namespace) {
        return Strict.registry.lookup(type, id, namespace);
    },

    // This is how you navigate around the app.
    // this gets called by a global click handler that handles
    // all the <a> tags in the app.
    // it expects a url without a leading slash.
    // for example: "costello/settings".
    navigate: function (page) {
        var url = (page.charAt(0) === '/') ? page.slice(1) : page;
        app.history.navigate(url, true);
    },

    // navigate to the task detail view with the right context set
    viewTaskDetail: function (task) {
        if (app.currentPage.template === 'starred') {
            app.navigate(window.location.pathname.slice(4) + '/' + task.id);
        } else {
            app.navigate(task.url);
        }
    },
    // here we can handle external link clicks that we'd like to embed instead.
    // stubbed out for now.
    handleExternalLinkClick: function (e) {
        /*
        var view;

        switch (e.target.host) {

        case '':
            // simply add cases here
            return false;
        }
        */
    },
    // this is what handles all the page rendering and
    // setting the correct page indicator etc.
    // It's done at this so that views don't have to worry
    // about their page position.
    // It simply matches urls to figure out which item should
    // be 'active'.
    renderPage: function (view, animation) {
        var container = $('#pages');

        // default animation is swap
        animation || (animation = 'swap');

        if (app.currentPage) {
            app.currentPage.hide(animation);
            app.trigger('pageunloaded', app.currentPage);
        }
        // we call render, but if animation is none, we want to tell the view
        // to start with the active class already before appending to DOM.
        container.append(view.render(animation === 'none').el);
        view.show(animation);
    },
    // this can only be called once and is used to track loading statistics
    reportLoadStats: function () {
        var cleaned;
        stats.recordTime('fully_loaded');

        cleaned = stats.get();
        logger.log('load stats', JSON.stringify(cleaned, null, 2));

        tracking.identify(me);
        tracking.track('webAppLoaded', cleaned);
    }
};
