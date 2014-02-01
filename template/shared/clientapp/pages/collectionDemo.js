var PageView = require('./base');
var templates = require('../templates');
var PersonView = require('../views/person');


module.exports = PageView.extend({
    title: 'collection demo',
    template: templates.pages.collectionDemo,
    events: {
        'click .shuffle': 'shuffle',
        'click .fetch': 'fetchCollection',
        'click .reset': 'resetCollection',
        'click .add': 'addRandom'
    },
    render: function () {
        this.renderAndBind();
        this.renderCollection(this.collection, PersonView, this.$('.people')[0]);
        if (!this.collection.length) {
            this.fetchCollection();
        }
    },
    fetchCollection: function () {
        this.collection.fetch();
        return false;
    },
    resetCollection: function () {
        this.collection.reset();
    },
    shuffle: function () {
        this.collection.comparator = function () {
            return !Math.round(Math.random());
        };
        this.collection.sort();
        delete this.collection.comparator;
        return false;
    },
    addRandom: function () {
        function getRandom(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        }
        var firstNames = 'Joe Harry Larry Sue Bob Rose Angela Tom Merle Joseph Josephine'.split(' ');
        var lastNames = 'Smith Jewel Barker Stephenson Rossum Crockford'.split(' ');

        console.log(lastNames[getRandom(0, lastNames.length - 1)]);
        this.collection.create({
            firstName: firstNames[getRandom(0, firstNames.length - 1)],
            lastName: lastNames[getRandom(0, lastNames.length - 1)],
            coolnessFactor: getRandom(0, 15)
        });
    }
});
