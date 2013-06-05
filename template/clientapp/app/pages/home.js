var PageView = require('pages/base'),
    templates = require('templates');


module.exports = PageView.extend({
    template: templates.pages.home,
    render: function () {
        this.basicRender();
        return this;
    }
});
