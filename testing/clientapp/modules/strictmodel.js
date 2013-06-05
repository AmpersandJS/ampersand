//   (c) 2013 Henrik Joreteg
//   MIT Licensed
//   For all details and documentation:
//   https://github.com/HenrikJoreteg/StrictModel
(function () {
  'use strict';

  // Initial setup
  // -------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Strict = typeof exports !== 'undefined' ? exports : root.Strict = {},
    toString = Object.prototype.toString,
    slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Strict.VERSION = '0.0.1';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // Require Backbone, if we're on the server, and it's not already present.
  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');

  // Backbone Collection compatibility fix:
  // In backbone, when you add an already instantiated model to a collection
  // the collection checks to see if what you're adding is already a model
  // the problem is, it does this witn an instanceof check. We're wanting to
  // use completely different models so the instanceof will fail even if they
  // are "real" models. So we work around this by overwriting this method from
  // backbone 1.0.0. The only difference is it compares against our Strict.Model
  // instead of backbone's.
  Backbone.Collection.prototype._prepareModel = function (attrs, options) {
    if (attrs instanceof Strict.Model) {
      if (!attrs.collection) attrs.collection = this;
      return attrs;
    }
    options || (options = {});
    options.collection = this;
    var model = new this.model(attrs, options);
    if (!model._validate(attrs, options)) {
      this.trigger('invalid', this, attrs, options);
      return false;
    }
    return model;
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var Constructor = function () {};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function (parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () { return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    Constructor.prototype = parent.prototype;
    child.prototype = new Constructor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Mixins
  // ------

  // Sugar for defining properties a la ES5.
  var Mixins = Strict.Mixins = {
    // shortcut for Object.defineProperty
    define: function (name, def) {
      Object.defineProperty(this, name, def);
    },

    defineGetter: function (name, handler) {
      this.define(name, {
        get: handler.bind(this)
      });
    },

    defineSetter: function (name, handler) {
      this.define(name, {
        set: handler.bind(this)
      });
    }
  };

  // Strict.Registry
  // ---------------

  // Internal storage for models, seperate namespace
  // storage from default to prevent collision of matching
  // model type+id and namespace name

  var Registry = Strict.Registry = function () {
    this._cache = {};
    this._namespaces = {};
  };

  // Attach all inheritable methods to the Registry prototype.
  _.extend(Registry.prototype, {
    // Get the general or namespaced internal cache
    _getCache: function (ns) {
      if (ns) {
        this._namespaces[ns] || (this._namespaces[ns] = {});
        return this._namespaces[ns];
      }
      return this._cache;
    },

    // Find the cached model
    lookup: function (type, id, ns) {
      var cache = this._getCache(ns);
      return cache && cache[type + id];
    },

    // Add a model to the cache if it has not already been set
    store: function (model) {
      var cache = this._getCache(model._namespace),
        key = model.type + model.id;
      // Prevent overriding a previously stored model
      cache[key] = cache[key] || model;
      return this;
    },

    // Remove a stored model from the cache, return `true` if removed
    remove: function (type, id, ns) {
      var cache = this._getCache(ns);
      if (this.lookup.apply(this, arguments)) {
        delete cache[type + id];
        return true;
      }
      return false;
    },

    // Reset internal cache
    clear: function () {
      this._cache = {};
      this._namespaces = {};
    }
  });

  // Create the default Strict.registry.
  Strict.registry = new Registry();

  // Strict.Model
  // ------------

  var Model = Strict.Model = function (attrs, options) {
    attrs = attrs || {};
    options = options || {};

    var modelFound,
      opts = _.defaults(options || {}, {
        seal: true
      });

    this._namespace = opts.namespace;
    this._initted = false;
    this._deps = {};
    this._initProperties();
    this._initCollections();
    this._cache = {};
    this._verifyRequired();
    this.set(attrs, {silent: true});
    this.init.apply(this, arguments);
    if (attrs.id) Strict.registry.store(this);
    this._previous = _.clone(this.attributes); // Should this be set right away?
    this._initted = true;
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Backbone.Events, Mixins, {
    idAttribute: 'id',
    idDefinition: {
      type: 'number',
      setOnce: true
    },

    // stubbed out to be overwritten
    init: function () {
      return this;
    },

    // Remove model from the registry and unbind events
    remove: function () {
      if (this.id) {
        Strict.registry.remove(this.type, this.id, this._namespace);
      }
      this.trigger('remove', this);
      this.off();
      return this;
    },

    set: function (key, value, options) {
      var self = this,
        changing = self._changing,
        opts,
        changes = [],
        newType,
        interpretedType,
        newVal,
        def,
        attr,
        attrs,
        val;

      self._changing = true;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key === null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      opts = options || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];
        newType = typeof val;
        newVal = val;

        def = this.definition[attr] || {};

        // check type if we have one
        if (def.type === 'date') {
          if (!_.isDate(val)) {
            try {
              newVal = (new Date(parseInt(val, 10))).valueOf();
              newType = 'date';
            } catch (e) {
              newType = typeof val;
            }
          } else {
            newType = 'date';
            newVal = val.valueOf();
          }
        } else if (def.type === 'array') {
          newType = _.isArray(val) ? 'array' : typeof val;
        } else if (def.type === 'object') {
          // we have to have a way of supporting "missing" objects.
          // Null is an object, but setting a value to undefined
          // should work too, IMO. We just override it, in that case.
          if (typeof val !== 'object' && _.isUndefined(val)) {
            newVal = null;
            newType = 'object';
          }
        }

        // If we have a defined type and the new type doesn't match, throw error.
        // Unless it's not required and the value is undefined.
        if (def.type && def.type !== newType && (!def.required && !_.isUndefined(val))) {
          throw new TypeError('Property \'' + attr + '\' must be of type ' + def.type + '. Tried to set ' + val);
        }

        // if trying to set id after it's already been set
        // reject that
        if (def.setOnce && def.value !== undefined && !_.isEqual(def.value, newVal)) {
          throw new TypeError('Property \'' + key + '\' can only be set once.');
        }

        // only change if different
        if (!_.isEqual(def.value, newVal)) {
          self._previous && (self._previous[attr] = def.value);
          def.value = newVal;
          changes.push(attr);
        }
      }

      _.each(changes, function (key) {
        if (!opts.silent) {
          self.trigger('change:' + key, self, self[key]);
        }
        // TODO: ensure that all deps are not undefined before triggering a change event
        (self._deps[key] || []).forEach(function (derTrigger) {
          // blow away our cache
          delete self._cache[derTrigger];
          if (!opts.silent) self.trigger('change:' + derTrigger, self, self.derived[derTrigger]);
        });
      });

      // fire general change events
      if (changes.length) {
        if (!opts.silent) self.trigger('change', self);
      }
    },

    get: function (attr) {
      return this[attr];
    },

    // convenience methods for manipulating array properties
    addListVal: function (prop, value, prepend) {
      var list = _.clone(this[prop]) || [];
      if (!_(list).contains(value)) {
        list[prepend ? 'unshift' : 'push'](value);
        this[prop] = list;
      }
      return this;
    },

    previous: function (attr) {
      return attr ? this._previous[attr] : _.clone(this._previous);
    },

    removeListVal: function (prop, value) {
      var list = _.clone(this[prop]) || [];
      if (_(list).contains(value)) {
        this[prop] = _(list).without(value);
      }
      return this;
    },

    hasListVal: function (prop, value) {
      return _.contains(this[prop] || [], value);
    },

    // -----------------------------------------------------------------------

    _initCollections: function () {
      var coll;
      if (!this.collections) return;
      for (coll in this.collections) {
        this[coll] = new this.collections[coll]();
        this[coll].parent = this;
      }
    },

    // Check that all required attributes are present
    // TODO: should this throw an error or return boolean?
    _verifyRequired: function () {
      var attrs = this.attributes;
      for (var def in this.definition) {
        if (this.definition[def].required && typeof attrs[def] === 'undefined') {
          return false;
        }
      }
      return true;
    },

    _initProperties: function () {
      var self = this,
        definition = this.definition = {},
        val,
        prop,
        item,
        type,
        filler;

      this.cid = _.uniqueId('model');

      function addToDef(name, val, isSession) {
        var def = definition[name] = {};
        if (_.isString(val)) {
          // grab our type if all we've got is a string
          type = self._ensureValidType(val);
          if (type) def.type = type;
        } else {
          type = self._ensureValidType(val[0] || val.type);
          if (type) def.type = type;
          if (val[1] || val.required) def.required = true;
          // set default if defined
          def.value = !_.isUndefined(val[2]) ? val[2] : val.default;
          if (isSession) def.session = true;
          if (val.setOnce) def.setOnce = true;
        }
      }

      // loop through given properties
      for (item in this.props) {
        addToDef(item, this.props[item]);
      }
      // loop through session props
      for (prop in this.session) {
        addToDef(prop, this.session[prop], true);
      }

      // always add "id" as a definition or make sure it's 'setOnce'
      if (definition.id) {
        definition[this.idAttribute].setOnce = true;
      } else {
        addToDef(this.idAttribute, this.idDefinition);
      }

      // register derived properties as part of the definition
      this._registerDerived();
      this._createGettersSetters();

      // freeze attributes used to define object
      if (this.session) Object.freeze(this.session);
      //if (this.derived) Object.freeze(this.derived);
      if (this.props) Object.freeze(this.props);
    },

    // just makes friendlier errors when trying to define a new model
    // only used when setting up original property definitions
    _ensureValidType: function (type) {
      return _.contains(['string', 'number', 'boolean', 'array', 'object', 'date'], type) ? type : undefined;
    },

    _validate: function () {
      return true;
    },

    _createGettersSetters: function () {
      var item, def, desc, self = this;

      // create getters/setters based on definitions
      for (item in this.definition) {
        def = this.definition[item];
        desc = {};
        // create our setter
        desc.set = function (def, item) {
          return function (val, options) {
            self.set(item, val);
          };
        }(def, item);
        // create our getter
        desc.get = function (def, attributes) {
          return function (val) {
            if (typeof def.value !== 'undefined') {
              if (def.type === 'date') {
                return new Date(def.value);
              }
              return def.value;
            }
            return;
          };
        }(def);

        // define our property
        this.define(item, desc);
      }

      this.defineGetter('attributes', function () {
        var res = {};
        for (var item in this.definition) res[item] = this[item];
        return res;
      });

      this.defineGetter('keys', function () {
        return Object.keys(this.attributes);
      });

      this.defineGetter('json', function () {
        return JSON.stringify(this._getAttributes(false, true));
      });

      this.defineGetter('derived', function () {
        var res = {};
        for (var item in this._derived) res[item] = this._derived[item].fn.apply(this);
        return res;
      });

      this.defineGetter('toTemplate', function () {
        return _.extend(this._getAttributes(true), this.derived);
      });
    },

    _getAttributes: function (includeSession, raw) {
      var res = {};
      for (var item in this.definition) {
        if (!includeSession) {
          if (!this.definition[item].session) {
            res[item] = (raw) ? this.definition[item].value : this[item];
          }
        } else {
          res[item] = (raw) ? this.definition[item].value : this[item];
        }
      }
      return res;
    },

    // stores an object of arrays that specifies the derivedProperties
    // that depend on each attribute
    _registerDerived: function () {
      var self = this, depList;
      if (!this.derived) return;
      this._derived = this.derived;
      for (var key in this.derived) {
        depList = this.derived[key].deps || [];
        _.each(depList, function (dep) {
          self._deps[dep] = _(self._deps[dep] || []).union([key]);
        });

        // defined a top-level getter for derived keys
        this.define(key, {
          get: _.bind(function (key) {
            // is this a derived property we should cache?
            if (this._derived[key].cache) {
              // do we have it?
              if (this._cache.hasOwnProperty(key)) {
                return this._cache[key];
              } else {
                return this._cache[key] = this._derived[key].fn.apply(this);
              }
            } else {
              return this._derived[key].fn.apply(this);
            }
          }, this, key),
          set: _.bind(function (key) {
            var deps = this._derived[key].deps,
              msg = '"' + key + '" is a derived property, you can\'t set it directly.';
            if (deps && deps.length) {
              throw new TypeError(msg + ' It is dependent on "' + deps.join('" and "') + '".');
            } else {
              throw new TypeError(msg);
            }
          }, this, key)
        });
      }
    }
  });

  // Set up inheritance for the model
  Strict.Model.extend = extend;

  // Overwrite Backbone.Model so that collections don't need to be modified in Backbone core
  Backbone.Model = Strict.Model;

}).call(this);
