var BaseView = require('views/base'),
    _ = require('underscore'),
    key = require('keymaster');


// this is a generic view for binding a collection of subviews
// it requires that you pass in an object with options. Here
// are the options:
//
// {
//     el: <container element>,
//     collection: <backbone collection>,
//     sortable: <bool optional>,
//     selectable: <bool optional>,
//     model: <parent model> // this is only required for
// }
module.exports = BaseView.extend({
    // our container for rendered subviews
    _views: [],

    initialize: function (options) {
        // set some default options
        _.defaults(options, {
            // TODO: change selectable to focusable.
            sortable: false,
            selectable: true,
            refreshInterval: 0 // how often to auto-trigger refresh (for time based filters)
        });
        // extend our view with passed in properties
        _.extend(this, options);
        if (options.refreshInterval) this.refreshLoop();
        this.bindomatic(app, 'pageunloaded', this.stopListening);
        this.bindomatic(this.collection, 'all', this.renderCollection, {trigger: true});
    },
    render: function () {
        this.delegateEvents();
        this.handleBindings();
        this.handleFocusedItem();
        return this;
    },
    desist: function () {
        this.stopListening();
        this.stopLoop = true;
    },
    filterBy: function (fn) {
        var filteredModels = _.filter(this.getModels(), fn);
        this.renderCollection({models: filteredModels});
    },
    refreshLoop: function () {
        var self = this;
        setTimeout(function () {
            // unless the loop is stopped call self.
            if (!self.stopLoop) {
                // if we're currently dragging something we'll wait till the next
                // one to actually re-render.
                if ($(self.el).find('.ui-sortable-placeholder').length === 0) {
                    self.renderCollection();
                }
                self.refreshLoop();
            }
        }, this.refreshInterval);
    },
    getModels: function () {
        if (typeof this.collection.models === 'function') {
            return this.collection.models();
        } else {
            return this.collection.models;
        }
    },
    // re-render the whole collection portion
    renderCollection: function (options) {
        var self = this,
            models = (typeof options !== 'undefined' && options.models) ? options.models : this.getModels();

        this.removeAllViews();

        _(models).each(function (model) {
            self.appendView(model);
        });

        if (this.sortable) {
            this.makeSortable();
        }

        this.trigger('rendered', this);
    },
    removeAllViews: function () {
        _(this._views).each(function (view) {
            view.desist({quick: true});
        });
        this._views = [];
        $(this.el).empty();
    },
    appendView: function (model) {
        this._views.push(new this.ViewConstructor({model: model, containerEl: this.el, parent: this}));
    },
    makeSortable: function () {
        var self = this;
        function getModelFromEl(el) {
            return self.collection.get(el.attr('id'));
        }

        $(this.el).sortable({
            update: function (e, ui) {
                var el = $(ui.item);
                // this intercepts the items dropped off of the list
                // for example to be delegated
                if (ui.position.left < 0) {
                    $(this).sortable('cancel');
                    return;
                }
                var idArray = $(this).sortable('toArray');
                self.parent.trigger('resorted', idArray, el.attr('id'), el.index());
            },
            start: function (e, ui) {
                if (app.eventsDisabled) {
                    e.stopPropagation();
                }
                var model = getModelFromEl(ui.item);
                // make sure this task is focused
                me.focusedItem = model;
            },
            zIndex: 500000,
            appendTo: 'body',
            helper: 'clone'
        });
    },
    handleFocusedItem: function () {
        // if a task from this collection is focused, then leave it, if not reset it
        if (!this.collection.get(me.focusedItem)) {
            if (!$('.mainPageInput').is(':focus') && this.collection.length > 0) {
                me.focusedItem = this.collection.first();
            } else {
                me.focusedItem = null;
            }
        }
    },
    handleTabKey: function (e) {
        var shift = e.shiftKey,
            model = me.focusedItem,
            models = this.getModels(),
            i = _(models).indexOf(model),
            omniBox = $('.mainPageInput');

        if (model) {
            // right
            if (shift) {
                if (i === 0) {
                    omniBox.focus();
                } else {
                    $(':focus').blur();
                    this.focusPrevious(e);
                }
            } else {
                if (i + 1 >= models.length) {
                    omniBox.focus();
                } else {
                    $(':focus').blur();
                    this.focusNext(e);
                }
            }
        } else {
            if (models.length) {
                $(':focus').blur();
                if (shift) {
                    this.focusPrevious(e);
                } else {
                    this.focusNext(e);
                }
            } else {
                omniBox.focus();
            }
        }
        //debugger;

    },
    focusNext: function (e) {
        var next = this.collection.next(me.focusedItem);
        me.focusedItem = next;
        $(':focus').blur();
        if (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    },
    focusPrevious: function (e) {
        var prev = this.collection.prev(me.focusedItem);
        me.focusedItem = prev;
        $(':focus').blur();
        if (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    }
});
