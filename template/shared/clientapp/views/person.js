var View = require('ampersand-view');
var templates = require('../templates');


module.exports = View.extend({
    template: templates.includes.person,
    autoRender: true,
    bindings: {
        fullName: '.name',
        avatar: ['.avatar', 'src']
    },
    events: {
        'click .delete': 'handleRemoveClick'
    },
    handleRemoveClick: function () {
        this.model.destroy();
        return false;
    }
});
