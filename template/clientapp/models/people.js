var Backbone = require('backbone');
var Person = require('./person');


module.exports = Backbone.Collection.extend({
    model: Person,
    url: '/api/people'
});
