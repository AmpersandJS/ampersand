# human-model

Human Models are meant to work as a drop-in replacement for Backbone models. In fact, it's extensively tested against the unit tests from Backbone (open test/index.html to run). 

However, Human Models are far more restrictive and structured. They force you to specify properties (at at minimum their types) for things you want it to store.


## Module sytems/loaders/managers

Thanks to @svnlto, HumanModel uses UMD so it works as CommonJS (node + browserify), AMD, and as a standalone script tag.

## Installing

via npm:

```
npm install human-model
```

via bower: 

```
bower install human-model
```

## Why do this?

Backbone models have a lot of flexibility in that you don't have to define what you're wanting to store ahead of time. 

The only challenge with that is that for more complex applications is actually becomes quite difficult to remember what properties are available to you.

Using human models means they're much more self-documenting and help catch bugs. Someone new to the project can read the models and have a pretty good idea of how the app is put together.

It also uses's ES5's fancy `Object.defineProperty` to treat model attributes as if they were properties.

That means with Human Model you can set an attribute like this: `user.name = 'henrik'` and still get a `change:name` event fired. 

Obviously, this restriction also means that this won't work in browsers that don't support that. You can check specific browser support here: http://kangax.github.io/es5-compat-table/


## Key Differences from Backbone

Everything Backbone does with Collections should Just Work™ with HumanModel as long as you specify a HumanModel constructor as a collection's `model` property.

**important**: One key point to understand is that unlike backbone. You're actually passing an object definition that describes the Model, not just methods to attach to its prototype. For example, you'll notice we call `HumanModel.define()` instead of `Backbone.Model.extend()`. This is to make the distinction clear.

Besides that and the obvious differences, any behavior that doesn't match Backbone should be considered a bug.


### Explicit model definitions

Schema definitions take an attribute called `props` to defined properties.

Property names can be defined two different ways, either an array with `[type, required, default]`,
or an object: `{ type: 'string', required: true, default: '' , allowNull: false}`

types can be: `string`, `number`, `boolean`, `array`, `object`, or `date`
required: true, false (optional)
default: any (optional)
setOnce: true, false (optional)
test: function (optional)
allowNull: true, false (optional)
values: `['some', 'valid', 'values']`(optional) 

Note that when defining with an array `type`, `required`, and `default`
are the only property attributes you can set.

If `required` is true, the attribute will always have a value even if it is not explicitly set or is cleared.  If a default is given, that will be used.  If no default is given a default for its data type will be used (e.g. '' for string, {} for object)

If a `default` is given, the attribute will default to that value when the model is instantiated.

If `setOnce` is true, the attribute will throw an error if anything tries to set its value more than once.

If `values` is provided, you can only set that property to a value in the list. You can use this in combination with `type` to check both, or just use `values` and `default` by themselves. This is handy for `enum`-type stuff. For example:

```js
props: {
    alignment: {
        values: ['top', 'middle', 'bottom'],
        default: 'middle'
    }
}
```

If given, `test` should be a function that expects the new value (and optionally the new type) of the attribute.  It should return an error message on failure, and false on success

```js
props: {
    firstName: ['string', true, 'Jim']
    lastName: {
        type: 'string', 
        required: false, 
        default: 'Bob' 
    }
}
```

### A sample model with comments

```js
var Person = HumanModel.define({
    // every human model should have a type
    type: 'member',
    init: function () {
        // main initialization function
    },
    // props are for properties that exist on the server
    props: {
        id: {
            type: 'number',
            setOnce: true
        },
        firstName: ['string', true],
        lastName: ['string', true],
        created: ['date'],
        email: ['string', true],
        username: ['string', true],
        lastLogin: ['date'],
        largePicUrl: ['string'],
        department: {
            type: 'number',
            // you can optionally provide your own test function
            test: function (val) {
                if (val > 20) {
                    return "Invalid department";
                }
            }
        },
        alignment: {
            // you can also specify a list of valid values
            values: ['top', 'middle', 'bottom'],
            default: 'middle'
        }
    },
    // derived properties and their dependencies. If any dependency changes
    // that will also trigger a 'change' event on the derived property so
    // we know to re-render the template
    derived: {
        // fullName is 
        fullName: {
            // you can optionally define the properties this derived property
            // depends on. That way if the underlying properties change you can
            // listen for changes directly on the derived property.
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.firstName + ' ' + this.lastName;
            }
        }
    },
    // Session properties are browser state for a model
    // these trigger 'change' events when set, but are not
    // included when serializing or saving to server.
    session: {
        selectedTasks: ['array', true, []],
        lastPage: ['string', true, 'tasks'],
        unread: ['boolean', true, false],
        active: ['boolean', true, false]
    },
    // child collections that will be initted. They will
    // be created at as a property of the same name as the
    // key. The child collection will also be given a reference
    // to its parent.
    collections: {
        // messages: Messages
    },
    otherMethods: function (cb) {
        // of course you can tack on whatever other methods you want
    }
});
```

### Going hardcore "strict" definition

[Strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode) in JS is pretty great and is fairly well supported in modern browsers.

If you want to be *really* hardcore about not letting you set properties that aren't defined, you can specify `seal: true` when defining your model.

```js
// enable strict mode
"use strict";

var MySuperStrictModel = HumanModel.define({
    // set this to true
    seal: true,
    // also throw errors for properties not defined
    // when set via `set`.
    extraProperties: 'reject',
    // normal properties
    props: {
        name: 'string'
    }
});

// create an instance of this model
var model = new MySuperStrictModel();

// setting defined properties works like usual
model.name = 'something';

// BUT, setting a property that doesn't exist
// will throw an error because the object is sealed.
model.something = 'something else'; // KABOOM!

```

### Setting model attributes

```js
// backbone:
user.set('firstName', 'billy bob');

// human:
user.firstName = 'billy bob';

// p.s. you can still do it the other way in human (so you can still pass otions)
user.set('firstName', 'billy bob', {silent: true})
```

### Getting model attributes

```js
// backbone:
user.get('firstName');

// human
user.firstName;
```

## The Registry

HumanModel also inits a global registery for storing all initted models. It's designed to be used for looking up models based on their type, id and optional namespace.

It's purpose is finding/updating models when we get updates pushed to us from the server. This is very important for buildling realtime apps.

TODO: needs more docs on the registry.

## Tests

An extensive suite of tests can be run by opening `test/index.html` in a browser. In order to ensure compatibility with backbone to the extent possible I started with all the tests from Backbone 1.0.0 and modified them to use HumanModel.

## Caveats 

- Since backbone does an `instanceof` check when adding initted models to a collection, HumanModel monkey patches the `_prepareModel` collection method to check against HumanModel instead.
- Still needs better docs. Probably a full docs site.

## Authors

Created by [@HenrikJoreteg](http://twitter.com/henrikjoreteg) with contributions from:

- [@beausorensen](http://twitter.com/beausorensen)
- [@LanceStout](https://twitter.com/lancestout)
- [@philip_roberts](https://twitter.com/philip_roberts)
- [@svenlito](https://twitter.com/svenlito)


## Changelog

 - 2.6.0 - Cached, derived properties only fire change events now if new derived value is different from cache, instead of blindly firing change events if dependent properties changed.
 - 2.5.0 - UMD support by @swenlito
 - 2.4.0 - Added `toggle` method for boolean properties and properties with `values`
 - 2.3.0 - Added `values` to property definition
 - 2.2.0 - Added test parameter to property definitions
 - 2.1.0 - Added allowNull parameter to property definitions
 - 2.0.0 - Minor, but incompatible fix that remove `toServer` getter in lieu of adding `serialize` method that can be overridden.
 - 1.4.0 - Find/fix performance bottleneck. Significantly faster to instantiate larger numbers of models now.
 - 1.3.0 - Fix bug where session props were included in `.save()`
 - 1.2.0 - Make it possible to overwrite or extend data types.
 - 1.0.0 - Switching from `extend()` to `define()` pattern for building a model definition.

## License

MIT
