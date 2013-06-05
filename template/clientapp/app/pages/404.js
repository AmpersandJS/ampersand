var PageView = require('pages/base'),
    templates = require('templates');


module.exports = PageView.extend({
    template: templates.pages.fourOhFour,
    render: function () {
        this.pageRender();
        return this;
    }
});
