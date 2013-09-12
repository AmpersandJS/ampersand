/*global app, me, $*/
// This app view is responsible for rendering all content that goes into
// <html>. It's initted right away and renders iteslf on DOM ready.

// This view also handles all the 'document' level events such as keyboard shortcuts.
var HumanView = require('human-view');
var _ = require('underscore');
var templates = require('../templates');
//var key = require('keymaster');
var tracking = require('../helpers/metrics');
var setFavicon = require('favicon-setter');


module.exports = HumanView.extend({
    template: templates.body,
    initialize: function () {
        // this marks the correct nav item selected
        app.history.on('route', this.updateActiveNav, this);
    },
    events: {
        'click a[href]': 'handleLinkClick'
    },
    render: function () {
        // some additional stuff we want to add to the document head
        $('head').append(templates.head());
        // main renderer
        this.renderAndBind({me: me});
        // setting a favicon for fun (note, it's dyanamic)
        setFavicon('/images/ampersand.png');
        //this.createGlobalNavShortcuts();
        return this;
    },

    handleLinkClick: function (e) {
        var t = $(e.target),
            aEl = t.is('a') ? t[0] : t.closest('a')[0],
            local = window.location.host === aEl.host,
            path = aEl.pathname.slice(1);


        // if the window location host and target host are the
        // same it's local, else, leave it alone
        if (!app.eventsDisabled) {
            if (local) {
                app.navigate(path);
                return false;
            } else {
                app.handleExternalLinkClick(e);
            }
        }

        return false;
    },

    updateActiveNav: function () {
        var pathname = window.location.pathname;
        $('.nav a').each(function () {
            var navArray = _.compact($(this).attr('href').split('/')).join('/').toLowerCase(),
                pathArray = _.compact(pathname.split('/')).join('/').toLowerCase();

            if (pathArray === navArray) {
                $(this).parent().addClass('active');
            } else {
                $(this).parent().removeClass('active');
            }
        });
    },

    //////////////// UTIL METHODS ////////////////////
    createGlobalNavShortcuts: function () {
        /*
        var i = 1,
            self = this;

        function ifEmpty(func) {
            return function (e) {
                if (!e.isInput) {
                    func();
                    e.preventDefault();
                }
            };
        }
        // blur input on 'esc'
        key('esc', function (e) {
            me.keyboardShortcutMode = true;
            if (e.isInput) {
                e.element.blur();
            } else if (me.selectedItems.length) {
                me.deselectAll();
            }
        });
        // select main input
        key('n', function (e) {
            if (!e.isInput) {
                self.focusMainInput();
                return false;
            }
        });
        // global help shortcut: '?'
        key('shift+/', ifEmpty(app.openHelpWindow));
        */
    }
});
