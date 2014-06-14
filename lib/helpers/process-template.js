// super simple template engine
var RE = /\{\{\{\s*(\S+)\s*\}\}\}/g;


module.exports = function processTemplate(templateString, context, rewrite) {
    return templateString.replace(RE, function (whole, specific) {
        return context[specific];
    });
};
