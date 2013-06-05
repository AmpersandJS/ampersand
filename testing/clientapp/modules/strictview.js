var Backbone = require('backbone'),
    _ = require('underscore'),
    templates = require('templates');


// the base view we use to build all our other views
module.exports = Backbone.View.extend({
    // ###handleBindings
    // This makes it simple to bind model attributes to the view.
    // To use it, add a `classBindings` and/or a `contentBindings` attribute
    // to your view and call `this.handleBindings()` at the end of your view's
    // `render` function. It's also used by `basicRender` which lets you do
    // a complete attribute-bound views with just this:
    //
    //         var ProfileView = BaseView.extend({
    //             template: 'profile',
    //             contentBindings: {
    //                 'name': '.name'
    //             },
    //             classBindings: {
    //                 'active': ''
    //             },
    //             render: function () {
    //                 this.basicRender();
    //                 return this;
    //             }
    //         });
    handleBindings: function () {
        var self = this;
        if (this.contentBindings) {
            _.each(this.contentBindings, function (selector, key) {
                var func = function () {
                    var el = (selector.length > 0) ? self.$(selector) : $(self.el);
                    el.html(self.model[key]);
                };
                self.listenTo(self.model, 'change:' + key, func);
                func();
            });
        }
        if (this.imageBindings) {
            _.each(this.imageBindings, function (selector, key) {
                var func = function () {
                    var el = (selector.length > 0) ? self.$(selector) : $(self.el);
                    el.attr('src', self.model[key]);
                };
                self.listenTo(self.model, 'change:' + key, func);
                func();
            });
        }
        if (this.hrefBindings) {
            _.each(this.hrefBindings, function (selector, key) {
                var func = function () {
                    var el = (selector.length > 0) ? self.$(selector) : $(self.el);
                    el.attr('href', self.model[key]);
                };
                self.listenTo(self.model, 'change:' + key, func);
                func();
            });
        }
        if (this.classBindings) {
            _.each(this.classBindings, function (selector, key) {
                var func = function () {
                    var newValue = self.model[key],
                        prevHash = self.model.previous(),
                        prev = _.isFunction(prevHash) ? prevHash(key) : prevHash[key],
                        el = (selector.length > 0) ? self.$(selector) : $(self.el);
                    if (_.isBoolean(newValue)) {
                        if (newValue) {
                            el.addClass(key);
                        } else {
                            el.removeClass(key);
                        }
                    } else {
                        if (prev) el.removeClass(prev);
                        el.addClass(newValue);
                    }
                };
                self.listenTo(self.model, 'change:' + key, func);
                func();
            });
        }
        if (this.inputBindings) {
            _.each(this.inputBindings, function (selector, key) {
                var func = function () {
                    var el = (selector.length > 0) ? self.$(selector) : $(self.el);
                    el.val(self.model[key]);
                };
                self.listenTo(self.model, 'change:' + key, func);
                func();
            });
        }
        return this;
    },

    // ###desist
    // This is method we used to remove/unbind/destroy the view.
    // By default we fade it out this seemed like a reasonable default for realtime apps.
    // So things to just magically disappear and to give some visual indication that
    // it's going away. You can also pass an options hash `{quick: true}` to remove immediately.
    desist: function (opts) {
        opts || (opts = {});
        _.defaults(opts, {
            quick: false,
            animate: true,
            speed: 300,
            animationProps: {
                height: 0,
                opacity: 0
            }
        });
        var el = $(this.el),
            kill = _.bind(this.remove, this);
        if (this.interval) {
            clearInterval(this.interval);
            delete this.interval;
        }
        if (opts.quick) {
            kill();
        } else if (opts.animate) {
            el.animate(opts.animationProps, {
                speed: opts.speed,
                complete: kill
            });
        } else {
            setTimeout(kill, opts.speed);
        }
    },

    // ###addReferences
    // This is a shortcut for adding reference to specific elements within your view for
    // access later. This is avoids excessive DOM queries and gives makes it easier to update
    // your view if your template changes. You could argue whether this is worth doing or not,
    // but I like it.
    // In your `render` method. Use it like so:
    //
    //         render: function () {
    //             this.basicRender();
    //             this.addReferences({
    //                 pages: '#pages',
    //                 chat: '#teamChat',
    //                 nav: 'nav#views ul',
    //                 me: '#me',
    //                 cheatSheet: '#cheatSheet',
    //                 omniBox: '#awesomeSauce'
    //             });
    //         }
    //
    // Then later you can access elements by reference like so: `this.$pages`, or `this.$chat`.
    addReferences: function (hash) {
        for (var item in hash) {
            this['$' + item] = $(hash[item], this.el);
        }
    },

    // ###basicRender
    // All the usual stuff when I render a view. It assumes that the view has a `template` property
    // that is the name of the ICanHaz template. You can also specify the template name by passing
    // it an options hash like so: `{templateKey: 'profile'}`.
    basicRender: function (opts) {
        var newEl;
        opts || (opts = {});
        _.defaults(opts, {
            templateFunc: (typeof this.template === 'string') ? templates[opts.templateKey] : this.template,
            context: false
        });
        newEl = $(opts.templateFunc(opts.contex));
        $(this.el).replaceWith(newEl);
        this.setElement(newEl);
        this.handleBindings();
        this.delegateEvents();
    },

    // ###subViewRender
    // This is handy for views within collections when you use `collectomatic`. Just like `basicRender` it assumes
    // that the view either has a `template` property or that you pass it an options object with the name of the
    // `templateKey` name of the ICanHaz template.
    // Additionally, it handles appending or prepending the view to its parent container.
    // It takes an options arg where you can optionally specify the `templateKey` and `placement` of the element.
    // If your collections is stacked newest first, just use `{plaement: 'prepend'}`.
    subViewRender: function (opts) {
        opts || (opts = {});
        _.defaults(opts, {
            placement: 'append',
            templateFunc: (typeof this.template === 'string') ? templates[opts.templateKey] : this.template
        });
        var data = _.isFunction(this.model.toTemplate) ? this.model.toTemplate() : this.model.toTemplate,
            newEl = $(opts.templateFunc(opts.context))[0];
        if (!this.el.parentNode) {
            $(this.containerEl)[opts.placement](newEl);
        } else {
            $(this.el).replaceWith(newEl);
        }
        this.setElement(newEl);
        this.handleBindings();
    },

    // ### bindomatic
    // Shortcut for listening and triggering
    bindomatic: function (object, events, handler, opts) {
        var bound = _.bind(handler, this);
        this.listenTo(object, events, bound);
        if (opts && opts.trigger || opts === true) bound();
    },

    // ###collectomatic
    // Shorthand for rendering collections and their invividual views.
    // Just pass it the collection, and the view to use for the items in the
    // collection. (anything in the `options` arg just gets passed through to
    // view. Again, props to @natevw for this.
    collectomatic: function (collection, ViewClass, options, desistOptions) {
        var views = {},
            self = this,
            refreshResetHandler;
        function addView(model, collection, opts) {
            var matches = self.matchesFilters ? self.matchesFilters(model) : true;
            if (matches) {
                views[model.cid] = new ViewClass(_({model: model}).extend(options));
                views[model.cid].parent = self;
            }
        }
        this.listenTo(collection, 'add', addView);
        this.listenTo(collection, 'remove', function (model) {
            if (views[model.cid]) {
                views[model.cid].desist(desistOptions);
                delete views[model.cid];
            }
        });
        this.listenTo(collection, 'move', function () {
            _(views).each(function (view) {
                view.desist({quick: true});
            });
            views = {};
            collection.each(addView);
        });
        refreshResetHandler = function (opts) {
            _(views).each(function (view) {
                view.desist({quick: true});
            });
            views = {};
            collection.each(addView);
        };
        this.listenTo(collection, 'refresh reset sort', refreshResetHandler);
        refreshResetHandler();
    }
});
