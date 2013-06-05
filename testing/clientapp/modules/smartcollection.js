// a collection-like view representing a filtered view of the underlying collection
var _ = require('underscore'),
    Backbone = require('backbone'),
    Collection;

// actually modifying the contents or sort order.
module.exports = Collection = function (options) {
    _.defaults(options, {
        filters: {},
        sortProperty: 'sortOrder',
        ordered: false
    });

    if (options.model && options.listProperty) {
        this.explicitlyListed = true;
    }

    if (options.comparator) {
        this.comparator = options.comparator;
    } else if (options.model && options.listProperty && options.explicitlySorted) {
        this.explicitlySorted = true;
    }

    // mix in all our goodies
    _.extend(this, options, Backbone.Events);

    // set up our change handlers
    this.listenTo(this.collection, 'all', _.bind(this.eventPassthrough, this));
    this.listenTo(this.collection, 'all', _.bind(this.handleUnderlyingChange, this));
    this.listenTo(this.collection, 'add', _.bind(this.handleAdd, this));
    if (this.model && this.sortProperty) {
        this.listenTo(this.model, 'change:' + this.sortProperty, _.bind(this.trigger, this, 'refresh'));
    }
    this.initialize.apply(this, arguments);
};

_.extend(Collection.prototype, {
    initialize: function (options) {
        // stubbed out
    },

    eventPassthrough: function (eventName, model) {
        if (_.contains(['remove', 'reset'], eventName) && (!model || this.matchesFilters(model))) {
            this.trigger.call(this, eventName, arguments);
        }
    },

    handleUnderlyingChange: function (eventName) {
        var property = eventName.slice(0, 6) === 'change' ? eventName.slice(7) : undefined;
        if (_(_.keys(this.filters)).contains(property)) {
            this.trigger('refresh');
        }
        if (eventName === 'refresh') this.trigger('refresh');
    },

    handleAdd: function (model) {
        var self = this,
            args = _.toArray(arguments),
            modelsBeforeAdd = this.models();
        if (this.matchesFilters(model)) {
            args.unshift('add');
            this.trigger.apply(this, args);
        }
        if (this.retestOnAll) {
            modelsBeforeAdd.forEach(function (model) {
                if (!self.matchesFilters(model)) {
                    self.trigger('remove', model, self);
                }
            });
        }
    },

    toJSON: function () {
        return _.map(this.models(), function (model) {
            return model.toJSON;
        });
    },
    // a filter is a property name and a function for checking
    // if it that property matches. Each property can only have one filter
    addFilter: function (newFilter) {
        _(this.filters).extend(newFilter);
        this.trigger('refresh');
    },
    // this removes a property from the filters list
    removeFilter: function (property) {
        delete this.filters[property];
        this.trigger('refresh');
    },
    matchesFilters: function (modelOrId) {
        var model = (typeof modelOrId === 'string') ? this.collection.get(modelOrId) : modelOrId,
            filter,
            val,
            attr;

        for (filter in this.filters) {
            val = this.filters[filter];
            attr = model && model.get(filter);

            if (_.isFunction(val)) {
                if (!val(model)) return false;
            } else if (_.isBoolean(val)) {
                attr = !!attr; // coerce to bool
                if (val != attr) return false;
            } else {
                if (attr !== val) return false;
            }
        }
        return true;
    },
    models: function () {
        var models,
            self = this;
        if (this.explicitlyListed) {
            models = _.filter(this.getExplicit(), _.bind(this.matchesFilters, this));
        } else {
            models = this.collection.filter(function (model) {
                return self.matchesFilters(model);
            });
        }
        return this.comparator ? _.sortBy(models, this.comparator) : models;
    },
    getExplicit: function () {
        var self = this;
        return _.chain(this.model.get(this.listProperty))
            .map(function (id) {
                return self.collection.get && self.collection.get(id) || self.collection.find(function (model) {model.id == id; });
            })
            .compact()
            .value();
    },
    get: function (id) {
        return _(this.models()).find(function (model) {
            return model.id;
        });
    },
    length: function () {
        return this.models().length;
    },
    at: function (index) {
        return this.models()[index];
    },
    next: function (idOrModel, startIndex) {
        var model = (typeof idOrModel === 'string') ? this.collection.get(idOrModel) : idOrModel,
            matched = this.models(),
            index = model ? _(matched).indexOf(model) : -1,
            length = matched.length;

        if (index === startIndex) return matched[startIndex];

        // if the array isn't empty and either none is selected, or the last is selected
        // we go to the first.
        // Under any other circumstance we select the current index + 1
        if (length > 0) {
            if (index === -1 || length === (index + 1) || length === 1) {
                return matched[0];
            } else {
                return matched[index + 1];
            }
        }
    },
    prev: function (idOrModel, startIndex) {
        var model = (typeof idOrModel === 'string') ? this.collection.get(idOrModel) : idOrModel,
            matched = this.models(),
            index = model ? _(matched).indexOf(model) : -1,
            length = matched.length;

        // if the array isn't empty and either none is selected, or the last is selected
        // we go to the first.
        // Under any other circumstance we select the current index + 1
        if (length > 0) {
            if (index === -1 || index === 0 || length === 1) {
                return _(matched).last();
            } else {
                return matched[index - 1];
            }
        }
    }
});

var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

_.each(methods, function (method) {
    Collection.prototype[method] = function () {
        return _[method].apply(_, [this.models()].concat(_.toArray(arguments)));
    };
});
