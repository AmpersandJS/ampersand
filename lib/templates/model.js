var Model = require('ampersand-model');


module.exports = Model.extend({
    type: 'model type',
    props: {
        id: 'string'
    },
    derived: {
        derivedId: {
            deps: ['id'],
            fn: function () {
                return this.id;
            }
        }
    }
});
