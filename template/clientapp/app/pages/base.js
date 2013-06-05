// base view for pages
var StrictView = require('strictview'),
    _ = require('underscore'),
    templates = require('templates'),
    key = require('keymaster');


module.exports = StrictView.extend({
    // register keyboard handlers
    registerKeyboardShortcuts: function () {
        var self = this;
        _.each(this.keyboardShortcuts, function (value, k) {
            // register key handler scoped to this page
            key(k, self.cid, _.bind(self[value], self));
        });
        key.setScope(this.cid);
    },
    unregisterKeyboardShortcuts: function () {
        key.deleteScope(this.cid);
    },
    show: function (animation) {
        // register page-specific keyboard shortcuts
        this.registerKeyboardShortcuts();

        // scroll page to top
        $('body').scrollTop(0);

        // handle cached pages
        if (this.detached) {
            this.$('#pages').append(this.el);
            this.detached = false;
        }

        // set the class so it comes into view
        this.$el.addClass('active');

        // store reference to current page
        app.currentPage = this;

        // set the document title
        document.title = _.result(this, 'title') + ' • &!';
        // trigger an event to the page model in case we want to respond
        this.trigger('pageloaded');
        return this;
    },
    hide: function () {
        var self = this;
        // remove the headerClass
        $('header').removeClass(_.result(this, 'headerClass'));
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
            this.desist({quick: true});
            // remove the element once it's animated out
            _.delay(function () {
                $(self.el).unbind().remove();
            }, 500);
        }
        // unbind page-specific keyboard shortcuts
        this.unregisterKeyboardShortcuts();
        return this;
    }
});
