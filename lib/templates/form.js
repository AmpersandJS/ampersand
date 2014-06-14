var FormView = require('ampersand-form-view');
{{{ requires }}}

module.exports = FormView.extend({
    fields: function () {
        return [
            {{{ fields }}}
        ];
    }
});
