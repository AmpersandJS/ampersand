// {{{ name }}} Collection - {{{ collectionFileName }}}.js
var AmpCollection = require('ampersand-rest-collection');
var {{{ name }}} = require('{{{ collectionToModelPath }}}');


module.exports = AmpCollection.extend({
    model: {{{ name }}},
    url: '{{{ url }}}'
});
