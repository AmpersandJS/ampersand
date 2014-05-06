module.exports = function (string, data) {
    return string.replace(/\{\{\{(\w+)\}\}\}/g, function (match, p1) {
        var value = data[p1];
        return value || match;
    });
};
