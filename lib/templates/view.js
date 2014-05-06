var View = require('ampersand-view');


module.exports = View.extend({
    template: '<div>new view</div>',
    render: function () {
        this.renderAndBind();
    }
});
