var _ = require('lodash');


module.exports = function (string, config) {
    string = string.replace(/\{\{\{(\w+)\}\}\}/g, function (match, p1) {
        var value = config[p1];
        return value || match;
    });

    return string.replace(/    /g, _.repeat(' ', config.indent));
};
