var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.person,
    textBindings: {
        fullName: '.name'
    },
    srcBindings: {
        'avatar': '.avatar'
    },
    events: {
        'click .delete': 'handleRemoveClick'
    },
    render: function () {
        this.renderAndBind();
    },
    handleRemoveClick: function () {
        this.model.destroy();
    }
});
