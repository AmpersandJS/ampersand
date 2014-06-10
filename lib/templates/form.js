var FormView = require('ampersand-form-view');
var InputView = require('ampersand-input-view');


module.exports = FormView.extend({
    getFields: function () {
        return [
{{{ fields }}}
        ];
    }
});
