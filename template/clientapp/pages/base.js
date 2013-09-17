/*global $*/
// base view for pages
var HumanView = require('human-view');
var _ = require('underscore');
//var key = require('keymaster');


module.exports = HumanView.extend({
    // register keyboard handlers
    registerKeyboardShortcuts: function () {
        /*
        var self = this;
        _.each(this.keyboardShortcuts, function (value, k) {
            // register key handler scoped to this page
            key(k, self.cid, _.bind(self[value], self));
        });
        key.setScope(this.cid);
        */
    },
    unregisterKeyboardShortcuts: function () {
        //key.deleteScope(this.cid);
    },
    show: function (animation) {
        var self = this;

        // register page-specific keyboard shortcuts
        //this.registerKeyboardShortcuts();

        // scroll page to top
        $('body').scrollTop(0);

        // handle cached pages
        if (this.detached) {
            this.$('#pages').append(this.el);
            this.detached = false;
        } else {
            // render the view
            this.render();
        }

        // if there's a data method, call it with a callback
        if (this.data) {
            this.data(function () {
                self.trigger('pagedataloaded');
            });
        }

        // set the class so it comes into view
        this.$el.addClass('active');

        // set the document title
        document.title = function () {
            var title = _.result(self, 'title');
            return title ? title + ' • humanjs' : 'humanjs';
        }();

        // trigger an event to the page model in case we want to respond
        this.trigger('pageloaded');

        return this;
    },
    hide: function () {
        var self = this;
        // hide the page
        this.$el.removeClass('active');
        // tell the model we're bailing
        this.trigger('pageunloaded');
        // if it's cached just detach it
        if (this.cache) {
            // hide the page
            this.$el.detach();
            this.detached = true;
        } else {
            // unbind all events bound for this view
            this.animateRemove();
        }
        // unbind page-specific keyboard shortcuts
        //this.unregisterKeyboardShortcuts();
        return this;
    }
});
