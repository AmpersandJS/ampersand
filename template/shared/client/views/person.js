var View = require('ampersand-view');
var templates = require('../templates');


module.exports = View.extend({
    template: templates.includes.person,
    bindings: {
        'model.fullName': '[role=name]',
        'model.avatar': {
            type: 'attribute',
            role: 'avatar',
            name: 'src'
        },
        'model.editUrl': {
            type: 'attribute',
            role: 'action-edit',
            name: 'href'
        },
        'model.viewUrl': {
            type: 'attribute',
            role: 'name',
            name: 'href'
        }
    },
    events: {
        'click [role=action-delete]': 'handleRemoveClick'
    },
    handleRemoveClick: function () {
        this.model.destroy();
        return false;
    }
});
