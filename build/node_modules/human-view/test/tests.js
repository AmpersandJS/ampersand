var collection;
var container;
var count = 0;
var names = [
    'Henrik Joreteg',
    'Bugs Bunny',
    'Scrooge McDuck',
    'Crazy Dave',
    'Arty Cee'
];
var modelData = names.map(function (name) {
    return {
        id: ++count,
        avatar: 'http://robohash.org/' + name.charAt(1),
        randomHtml: '<p>yo</p>',
        name: name,
        active: count === 2
    };
});

var MainView
var ItemView;

var Model = (window.HumanModel || Backbone.Model).extend({
    props: {
        id: 'number',
        name: 'string',
        html: 'string',
        url: 'string',
        something: 'string',
        fireDanger: 'string'
    },
    session: {
        active: 'boolean'
    }
});



function addModel() {
    count++;
    collection.add({
        name: 'test' + count,
        id: count
    });
}

QUnit.testStart(function () {
    collection = new Backbone.Collection();
    collection.model = Model;
    collection.add(modelData);

    collection.on('all', function () {
        console.log('collection event', arguments);
    });

    container = $('#qunit-fixture');

    // our item view
    ItemView = HumanView.extend({
        template: '<li><a href=""></a><span></span><input/></li>',
        initialize: function () {
            // register a misc handler so we can test release
            this.listenTo(this.model, 'change:something', function () {});
        },
        render: function () {
            this.renderAndBind();
            this.el.id = '_' + this.model.id;
            return this;
        }
    });

    MainView = HumanView.extend({
        render: function (opts) {
            this.$el.empty();
            this.$el.append('<ul></ul>');
            this.renderCollection(this.collection, ItemView, this.$('ul')[0], opts);
            return this;
        }
    });

    window.view = new MainView({
        el: container[0],
        collection: collection
    });
});

function numberRendered() {
    return container.find('li').length;
}

module('method: renderCollection');

test('test initial render', function() {
    window.view.render();
    equal(numberRendered(), collection.length);
});
test('add', function() {
    window.view.render();
    addModel();
    equal(numberRendered(), collection.length);
});
test('remove', 1, function () {
    window.view.render();
    collection.remove(collection.last());
    equal(numberRendered(), collection.length);
});
test('reset', function () {
    window.view.render();
    collection.reset();
    equal(numberRendered(), collection.length);
});
test('sort', function () {
    window.view.render();
    collection.comparator = function (model) {
        return model.get('name');
    }
    collection.sort();
    equal(numberRendered(), collection.length);
    var domIds = [];
    container.find('li').each(function () {
        domIds.push(Number(this.id.slice(1)));
    });
    deepEqual(domIds, [5, 2, 4, 1, 3]);
});
asyncTest('animateRemove', 2, function () {
    window.view.render();
    var prevAnimateRemove = ItemView.prototype.animateRemove;
    ItemView.prototype.animateRemove = function () {
        var self = this;
        this.$el.fadeOut(100, function () {
            self.remove();
        });
        ok('animateRemove called');
    };
    collection.remove(collection.last());
    setTimeout(function () {
        equal(numberRendered(), collection.length);
        // set it back
        ItemView.prototype.animateRemove = prevAnimateRemove;
        start();
    }, 150);
});
test('filtered', function () {
    window.view.render({
        filter: function (model) {
            return model.get('name').length > 10;
        }
    });
    equal(numberRendered(), 2);
});
test('reversed', function () {
    window.view.render({
        reverse: true
    });
    var domIds = [];
    container.find('li').each(function () {
        domIds.push(Number(this.id.slice(1)));
    });
    deepEqual(domIds, [5, 4, 3, 2, 1]);
});
test('cleanup', function () {
    window.view.render();
    equal(numberRendered(), collection.length);
    equal(collection.first()._events['change:something'].length, 1);
    window.view.remove();
    // when main view is removed so should registered event handler
    // from subview
    ok(!collection.first()._events['change:something']);
});
test('child view can chose to insert self', 6, function () {
    ItemView.prototype.insertSelf = true;
    ItemView.prototype.render = function (extraInfo) {
        ok(extraInfo.containerEl);
    };

    window.view.render();
    equal(numberRendered(), 0, 'Parent should not have rendered anything');
    window.view.remove();
});


module('method: subview methods');

test('registerSubview', function () {
    var removeCalled = 0;
    var SubView = HumanView.extend({
        render: function () {
            this.$el.addClass('subview');
        },
        remove: function () {
            removeCalled++;
        }
    });
    var View = HumanView.extend({
        render: function () {
            this.$el.empty();
            this.$el.html('<div id="parent"></div>');
            // all of these should work
            this.renderSubview(new SubView(), this.$('#parent'));
            this.renderSubview(new SubView(), this.$('#parent')[0]);
            this.renderSubview(new SubView(), '#parent');

            // some other thing with a remove method
            this.registerSubview({remove: function () {
                removeCalled++;
            }});
        }
    });

    var main = new View({
        el: container[0]
    });

    main.render();
    equal(main.$('.subview').length, 3);
    main.remove();
    equal(removeCalled, 4);
});


module('method: listenToAndRun');
asyncTest('basic', 1, function () {
    var model = new Model({
        props: {
            name: 'string'
        }
    });
    var View = HumanView.extend({
        initialize: function () {
            this.model = model;
            this.listenToAndRun(this.model, 'change', this.handler);
        },
        handler: function () {
            ok(true, 'handler ran');
            start();
        }
    });
    var view = new View();
});


module('method: registerBindings');

function getView(bindings, model) {
    if (!bindings.template) {
        bindings.template = '<li><span></span><img/></li>';
    }
    var View = HumanView.extend(bindings);
    var view = new View({
        model: model || new Model()
    });
    return view.renderAndBind();
}

test('textBindings', function () {
    var view = getView({
        textBindings: {
            name: 'span'
        }
    });
    equal(view.$('span').text(), '');
    view.model.set('name', 'henrik');
    equal(view.$('span').text(), 'henrik');
});

test('htmlBindings', function () {
    var view = getView({
        htmlBindings: {
            html: 'span'
        }
    });
    equal(view.$('span').html(), '');
    view.model.set('html', '<a>');
    equal(view.$('span').html(), '<a></a>');
});

test('srcBindings', function () {
    var view = getView({
        srcBindings: {
            url: 'img'
        }
    });
    ok(!view.$('img').attr('src'));
    view.model.set('url', 'http://robohash.com/whammo');
    equal(view.$('img').attr('src'), 'http://robohash.com/whammo');
});

test('hrefBindings', function () {
    var view = getView({
        template: '<a href=""></a>',
        hrefBindings: {
            url: ''
        }
    });
    equal(view.$el.attr('href'), '');
    view.model.set('url', 'http://robohash.com/whammo');
    equal(view.$el.attr('href'), 'http://robohash.com/whammo');
});

test('attributeBindings', function () {
    var view = getView({
        template: '<li><a href=""></a></li>',
        attributeBindings: {
            something: ['', 'data-thing']
        }
    });
    deepEqual(view.$el.data(), {});
    view.model.set('something', 'yo');
    deepEqual(view.$el.data('thing'), 'yo');
});

test('inputBindings', function () {
    var view = getView({
        template: '<li><input/></li>',
        inputBindings: {
            something: 'input'
        }
    });
    equal(view.$('input').val(), '');
    view.model.set('something', 'yo');
    equal(view.$('input').val(), 'yo');
});

test('classBindings', function () {
    var model = new Model();
    model.set({
        fireDanger: 'high',
        active: true
    });
    var view = getView({
        template: '<li></li>',
        classBindings: {
            fireDanger: '',
            active: ''
        }
    }, model);
    ok(view.$el.hasClass('active'));
    ok(view.$el.hasClass('high'));
    model.set('fireDanger', 'low');
    ok(!view.$el.hasClass('high'));
    ok(view.$el.hasClass('low'));
    model.set('active', false);
    ok(!view.$el.hasClass('active'));
    ok(view.$el.hasClass('low'));
});

module('error case: no model');

test('renderAndBind with no model', function () {
    var View = HumanView.extend({
        template: '<li><span></span><img/></li>',
        textBindings: { name: 'span' }
    });
    var view = new View();
    ok(view.renderAndBind()); //Should not throw error
});

test('registerBindings with no model', function () {
    var View = HumanView.extend({
        template: '<li><span></span><img/></li>',
        textBindings: { name: 'span' }
    });
    var view = new View();
    throws(view.registerBindings, Error, 'Throws error on no model');
});
