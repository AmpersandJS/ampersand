$(function() {
  var definition, Foo, Collection, collection;

  module("HumanModel", _.extend(new Environment, {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);

      definition = {
        type: 'foo',
        props: {
          id: 'number',
          firstName: ['string', true, 'defaults'],
          lastName: ['string', true],
          thing: {
            type: 'string',
            required: true,
            default: 'hi'
          },
          num: ['number', true],
          today: ['date'],
          hash: ['object'],
          list: ['array'],
          myBool: ['boolean', true, false],
          someNumber: {type: 'number', allowNull: true},
          good: {
              type: 'string',
              test: function (newVal) {
                  if (newVal !== 'good') {
                      return "Value not good";
                  }
              }
          }
        },
        session: {
          active: ['boolean', true, true]
        },
        derived: {
          name: {
            deps: ['firstName', 'lastName'],
            fn: function () {
              return this.firstName + ' ' + this.lastName;
            }
          },
          initials: {
            deps: ['firstName', 'lastName'],
            cache: false,
            fn: function () {
              // This currently breaks without both deps being set
              if (this.firstName && this.lastName) {
                return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
              }
              return '';
            }
          },
          isCrazy: {
            deps: ['crazyPerson'],
            fn: function () {
              return !!this.crazyPerson;
            }
          }
        }
      };

      Foo = HumanModel.define(definition);
      Collection = Backbone.Collection.extend({
        url : function() { return '/collection'; }
      });
    }
  }));

  test('should get the derived value', function () {
    var foo = new Foo({
      firstName: 'jim',
      lastName: 'tom'
    });
    strictEqual(foo.name, 'jim tom');
    strictEqual(foo.initials, 'JT');
  });

  test('should be sealable', 2, function () {
    definition.seal = true;
    var Bar = HumanModel.define(definition);
    var bar = new Bar();
    throws(function () {
      "use strict";
      bar.someProperty = 'new';
    }, TypeError, 'Throws exception in strict mode.');
    bar.someOtherProperty = 'something';
    ok(!bar.someOtherProperty, 'ignores properties otherwise');
  });

  test('should have default values for properties', 1, function () {
    var foo = new Foo({
      firstName: 'jim',
      lastName: 'tom'
    });
    strictEqual(foo.myBool, false);
  });

  test('should throw an error setting a derived prop', function () {
    var foo = new Foo();
    try { foo.name = 'bob'; }
    catch (err) { ok(err instanceof TypeError); }
  });

  test('Error when setting derived property should be helpful', function () {
    var foo = new Foo();
    try { foo.name = 'bob'; }
    catch (err) {
      equal(err.message, "\"name\" is a derived property, it can't be set directly.");
    }
  });

  test('should get correct defaults', function () {
    var foo = new Foo({});
    strictEqual(foo.firstName, 'defaults');
    strictEqual(foo.thing, 'hi');
  });

  test('Setting other properties when `extraProperties: "reject"` throws error', 1, function () {
    var Foo = HumanModel.define({
      extraProperties: 'reject'
    });
    var foo = new Foo();
    throws(function () {
      foo.set({
        craziness: 'new'
      });
    }, Error, 'Throws exception if set to rejcet');
  });

  test('Setting other properties ignores them by default', 1, function () {
    var foo = new Foo();
    foo.set({
      craziness: 'new'
    });
    strictEqual(foo.craziness, undefined, 'property should be ignored');
  });

  test('Setting other properties is ok if allowOtherProperties is true', 1, function () {
    var foo = new Foo();
    foo.extraProperties = 'allow';
    foo.set({
      craziness: 'new'
    });
    equal(foo.get('craziness'), 'new');
  });

  test('should throw a type error for bad data types', function () {
    try { new Foo({firstName: 3}); }
    catch (err) { ok(err instanceof TypeError); }

    try { new Foo({num: 'foo'}); }
    catch (err) { ok(err instanceof TypeError); }

    try { new Foo({hash: 10}); }
    catch (err) { ok(err instanceof TypeError); }

    try { new Foo({today: 10}); }
    catch (err) { ok(err instanceof TypeError); }

    try { new Foo({list: 10}); }
    catch (err) { ok(err instanceof TypeError); }
  });

  test('should validate model', 2, function () {
    var foo = new Foo();
    equal(foo._verifyRequired(), false);

    foo.firstName = 'a';
    foo.lastName = 'b';
    foo.thing = 'abc';
    foo.num = 12;
    ok(foo._verifyRequired());
  });

  test('should store previous attributes', function () {
    var foo = new Foo({
      firstName: 'beau'
    });
    foo.firstName = 'john';
    strictEqual(foo.firstName, 'john');
    strictEqual(foo.previous('firstName'), 'beau');
    foo.firstName = 'blah';
    strictEqual(foo.previous('firstName'), 'john');
  });

  test('should have list method helpers', function () {
    var foo = new Foo({
      hash: [1, 2, 'a', 'b']
    });
    ok(foo.hasListVal('hash', 2));

    foo.removeListVal('hash', 1);
    deepEqual([2, 'a', 'b'], foo.hash);

    foo.addListVal('hash', 10);
    deepEqual([2, 'a', 'b', 10], foo.hash);
  });

  test('should have data serialization methods', function () {
    var foo = new Foo({
      firstName: 'bob',
      lastName: 'tom',
      thing: 'abc'
    });

    strictEqual(foo.json, '{"firstName":"bob","lastName":"tom","thing":"abc","myBool":false}');
    deepEqual(foo.keys(), [
      'firstName',
      'lastName',
      'thing',
      'myBool',
      'active'
    ]);
    deepEqual(foo.attributes, {
      firstName: 'bob',
      lastName: 'tom',
      thing: 'abc',
      myBool: false,
      active: true
    });
    deepEqual(foo.toTemplate, {
      active: true,
      firstName: 'bob',
      lastName: 'tom',
      thing: 'abc',
      name: 'bob tom',
      isCrazy: false,
      initials: 'BT',
      myBool: false
    });
    deepEqual(foo.serialize(), {
      firstName: 'bob',
      lastName: 'tom',
      thing: 'abc',
      myBool: false
    });
  });

  test('serialize should not include session properties no matter how they\'re defined.', function () {
    var Foo = HumanModel.define({
      props: {
        name: 'string'
      },
      session: {
        // simple definintion
        active: 'boolean'
      }
    });

    var Bar = HumanModel.define({
      props: {
        name: 'string'
      },
      session: {
        // fuller definition
        active: ['boolean', true, false]
      }
    });

    var foo = new Foo({name: 'hi', active: true});
    var bar = new Bar({name: 'hi', active: true});
    deepEqual(foo.serialize(), {name: 'hi'});
    deepEqual(bar.serialize(), {name: 'hi'});
  });

  test('should fire events normally for properties defined on the fly', 1, function (next) {
    var foo = new Foo();
    foo.extraProperties = 'allow';
    foo.on('change:crazyPerson', function () {
      ok(true);
    });
    foo.set({
      crazyPerson: true
    });
  });

  test('should fire event on derived properties, even if dependent on ad hoc prop.', 1, function () {
    var Foo = new HumanModel.define({
      extraProperties: 'allow',
      derived: {
        isCrazy: {
          deps: ['crazyPerson'],
          fn: function () {
            return !!this.crazyPerson;
          }
        }
      }
    });
    var foo = new Foo();
    foo.extraProperties = 'allow';
    foo.on('change:isCrazy', function () {
      ok(true);
    });
    foo.set({
      crazyPerson: true
    });
  });

  test('should fire general change event on single attribute', 1, function (next) {
    var foo = new Foo({firstName: 'coffee'});
    foo.on('change', function () {
      ok(true);
    });
    foo.firstName = 'bob';
  });

  test('should fire single change event for multiple attribute set', 1, function (next) {
    var foo = new Foo({firstName: 'coffee'});
    foo.on('change', function () {
      ok(true);
    });
    foo.set({
      firstName: 'roger',
      lastName: 'smells'
    });
  });

  test('derived properties', function () {
    var ran = 0;
    var notCachedRan = 0;
    var Foo = HumanModel.define({
      props: {
        name: ['string', true]
      },
      derived: {
        greeting: {
          deps: ['name'],
          fn: function () {
            ran++;
            return 'hi, ' + this.name;
          }
        },
        notCached: {
          cache: false,
          deps: ['name'],
          fn: function () {
            notCachedRan++
            return 'hi, ' + this.name;
          }
        }
      }
    });
    var foo = new Foo({name: 'henrik'});
    strictEqual(ran, 0, 'derived function should not have run yet.');
    equal(foo.greeting, 'hi, henrik');
    equal(foo.greeting, 'hi, henrik');
    equal(ran, 1, 'cached derived should only run once');
    equal(notCachedRan, 0, 'shold not have been run yet')
    foo.name = 'someone';
    equal(foo.greeting, 'hi, someone');
    equal(foo.greeting, 'hi, someone');
    equal(ran, 2, 'cached derived should have been cleared and run once again');
    equal(notCachedRan, 1, 'shold have been run once because it was triggered');
    equal(foo.notCached, 'hi, someone');
    equal(notCachedRan, 2, 'incremented again');
    equal(foo.notCached, 'hi, someone');
    equal(notCachedRan, 3, 'incremented each time');
  });

  test('cached, derived properties should only fire change event if they\'ve actually changed', 3, function () {
    var changed = 0;
    var Foo = HumanModel.define({
      props: {
        name: ['string', true],
        other: 'string'
      },
      derived: {
        greeting: {
          deps: ['name', 'other'],
          fn: function () {
            return 'hi, ' + this.name;
          }
        }
      }
    });
    var foo = new Foo({name: 'henrik'});
    foo.on('change:greeting', function () {
      changed++
    });
    equal(changed, 0);
    foo.name = 'new';
    equal(changed, 1);
    foo.other = 'new';
    equal(changed, 1);
  });

  test('derived properties with derived dependencies', 5, function () {
    var ran = 0;
    var Foo = HumanModel.define({
      props: {
        name: ['string', true]
      },
      derived: {
        greeting: {
          deps: ['name'],
          fn: function () {
            return 'hi, ' + this.name;
          }
        },
        awesomeGreeting: {
          deps: ['greeting'],
          fn: function () {
            return this.greeting + '!';
          }
        }
      }
    });
    var foo = new Foo({name: 'henrik'});
    foo.on('change:awesomeGreeting', function () {
      ran++;
      ok(true, 'should fire derived event');
    });
    foo.on('change:greeting', function () {
      ran++;
      ok(true, 'should fire derived event');
    });
    foo.on('change:name', function () {
      ran++;
      ok(true, 'should fire derived event');
    });
    foo.on('change', function () {
      ran++;
      ok(true, 'should file main event')
    });
    foo.name = 'something';
    equal(ran, 4);
  });

  test('derived properties triggered with multiple instances', 2, function () {
    var foo = new Foo({firstName: 'Silly', lastName: 'Fool'});
    var bar = new Foo({firstName: 'Bar', lastName: 'Man'});

    foo.on('change:name', function () {
      ok('name changed');
    });
    foo.firstName = 'bob';
    bar.on('change:name', function () {
      ok('name changed');
    });
    bar.firstName = 'bob too';
  });

  test('should fire a remove event', 1, function (next) {
    var foo = new Foo({firstName: 'hi'});
    foo.on('remove', function () {
      ok(true);
    });
    foo.remove();
  });

  test('should remove all event bindings after remove', 1, function (next) {
    var foo = new Foo({thing: 'meow'});
    foo.on('change', function () {
      ok(false);
    });
    foo.remove();
    foo.thing = 'cow';
    ok(true);
  });

  test('should store models in the registry', 3, function () {
    var foo = new Foo({
      id: 1,
      firstName: 'roger',
      thing: 'meow'
    });
    var blah = HumanModel.registry.lookup('foo', 1);
    strictEqual(foo.firstName, blah.firstName);
    strictEqual(foo, blah);
    foo.on('change', function () {
      ok(true);
    });
    blah.firstName = 'blah';
  });

  test('should remove from registry on remove', 2, function () {
    var foo = new Foo({id: 20, lastName: 'hi'});
    foo.remove();
    var found = HumanModel.registry.lookup('foo', 20);
    ok(!found);
    // make a new one
    var bar = new Foo({id: 20});
    strictEqual(bar.lastName, '');
  });

  test('should be able to bind events even if sealed', 2, function () {
    var SealedModel = HumanModel.define({seal: true, props: {name: 'string'}});

    var s = new SealedModel({name: 'henrik'});

    equal(s.name, 'henrik', 'should have set name');
    s.on('change:name', function () {
      ok(true, 'event was triggered.');
    });

    s.name = 'superman'; // ridiculous, right?
  });

  test('Calling `previous` during change of derived cached property should work', 2, function () {
    var foo = new Foo({firstName: 'Henrik', lastName: 'Joreteg'});
    var ran = false;
    foo.on('change:name', function () {
      if (!ran) {
        equal(typeof foo.previous('name'), 'undefined');
        ran = true;
      } else {
        equal(foo.previous('name'), 'Crazy Joreteg');
      }
    });

    foo.firstName = 'Crazy';
    foo.firstName = 'Lance!';
  });

  test('Calling `previous` during change of derived property that is not cached, should be `undefined`', 1, function () {
    var foo = new Foo({firstName: 'Henrik', lastName: 'Joreteg'});

    // the initials property is explicitly not cached
    // so you should not be able to get a previous value
    // for it.
    foo.on('change:initials', function () {
      equal(typeof foo.previous('initials'), 'undefined');
    });

    foo.firstName = 'Crazy';
  });

  test('`.json` should not include session or derived properties', 1, function () {
    var foo = new Foo({firstName: 'Henrik', lastName: 'Joreteg'});
    foo.active = true;
    strictEqual(typeof JSON.parse(foo.json).active, 'undefined');
  });

  test('Should be able to define and use custom data types', 1, function () {
    var previousTypes = _.clone(HumanModel.dataTypes);

    HumanModel.dataTypes.crazyType = {
      set: function (newVal) {
        return {
          val: newVal,
          type: 'crazyType'
        };
      },
      get: function (val) {
        return val + 'crazy!'
      }
    };

    var Foo = HumanModel.define({
      props:{
        silliness: 'crazyType'
      }
    });

    var foo = new Foo({silliness: 'you '});

    equal(foo.silliness, 'you crazy!');

    // reset it
    HumanModel.dataTypes = previousTypes;
  });

  test('Should only allow nulls where specified', 2, function () {
    var foo = new Foo({
      firstName: 'bob',
      lastName: 'vila',
      someNumber: null
    });
    equal(foo.someNumber, null);
    throws(function () {
        foo.firstName = null;
    }, TypeError, 'Throws exception when setting unallowed null');
  });

  test('Attribute test function works', 2, function () {
      var foo = new Foo({good: 'good'});
      equal(foo.good, 'good');

      throws(function () {
          foo.good = 'bad';
      }, TypeError, 'Throws exception on invalid attribute value');
  });

  test('Values attribute basic functionality', 3, function () {
      var Model = HumanModel.define({
        props: {
          state: {
            values: ['CA', 'WA', 'NV']
          }
        }
      });

      var m = new Model();

      throws(function () {
        m.state = 'PR'
      }, TypeError, 'Throws exception when setting something not in list');

      equal(m.state, undefined, 'Should be undefined if no default');

      m.state = 'CA';

      equal(m.state, 'CA', 'State should be set');
  });

  test('Values attribute default works', 2, function () {
      var Model = HumanModel.define({
        props: {
          state: {
            values: ['CA', 'WA', 'NV'],
            default: 'CA'
          }
        }
      });

      var m = new Model();

      equal(m.state, 'CA', 'Should have applied the default');

      throws(function () {
        m.state = 'PR'
      }, TypeError, 'Throws exception when setting something not in list');

  });

  test('toggle() works on boolean and values properties.', 7, function () {
      var Model = HumanModel.define({
        props: {
          isAwesome: 'boolean',
          someNumber: 'number',
          state: {
            values: ['CA', 'WA', 'NV'],
            default: 'CA'
          }
        }
      });

      var m = new Model();

      throws(function () {
        m.toggle('someNumber');
      }, TypeError, 'Throws exception when toggling a non-togglable property.');

      m.toggle('state');
      equal(m.state, 'WA', 'Should go to next');
      m.toggle('state');
      equal(m.state, 'NV', 'Should go to next');
      m.toggle('state');
      equal(m.state, 'CA', 'Should go to next with loop');

      m.toggle('isAwesome')
      strictEqual(m.isAwesome, true, 'Should toggle even if undefined');
      m.toggle('isAwesome')
      strictEqual(m.isAwesome, false, 'Should toggle if true.');
      m.toggle('isAwesome')
      strictEqual(m.isAwesome, true, 'Should toggle if false.');
  });
});
