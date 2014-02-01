// replaces all whitespace with '-' and removes
// all non-url friendly characters
(function () {
var whitespace = /\s+/g,
    nonAscii = /[^A-Za-z0-9_ \-]/g;

function slugger(string, opts) {
    var maintainCase = opts && opts.maintainCase || false,
        replacement = opts && opts.replacement || '-',
        smartTrim = opts && opts.smartTrim,
        result,
        lucky;
    if (typeof string !== 'string') return '';
    if (!maintainCase) string = string.toLowerCase();
    result = string.replace(nonAscii, '').replace(whitespace, replacement);
    if (smartTrim && result.length > smartTrim) {
        lucky = result.charAt(smartTrim) === replacement;
        result = result.slice(0, smartTrim);
        if (!lucky) result = result.slice(0, result.lastIndexOf(replacement));
    }
    return result;
}

if (typeof module !== 'undefined') {
    module.exports = slugger;
} else {
    window.slugger = slugger;
}
})();
