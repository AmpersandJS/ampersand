var repeat = require('repeat-string');


module.exports = function clean(str, config) {
    return str
        .replace(/    /g, config.useTabs ? '\t' : repeat(' ', config.indent))
        .replace(/\'/g, config.quoteChar || '\'');
}
