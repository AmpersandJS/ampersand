var PageView = require('./base');
var templates = require('../templates');


module.exports = PageView.extend({
    title: 'home',
    template: templates.pages.home,
    render: function () {
        this.renderAndBind();
    }
});
