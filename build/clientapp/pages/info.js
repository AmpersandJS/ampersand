var PageView = require('./base');
var templates = require('../templates');

module.exports = PageView.extend({
    template: templates.pages.info,
    render: function () {
        this.renderAndBind();
    }
});
