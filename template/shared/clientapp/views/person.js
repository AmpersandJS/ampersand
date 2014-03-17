var View = require('ampersand-view');
var templates = require('../templates');


module.exports = View.extend({
    template: templates.includes.person,
    bindings: {
        fullName: '.name',
        avatar: ['.avatar', 'src']
    },
    events: {
        'click .delete': 'handleRemoveClick'
    },
    render: function () {
        this.renderAndBind();
    },
    handleRemoveClick: function () {
        this.model.destroy();
        return false;
    }
});
