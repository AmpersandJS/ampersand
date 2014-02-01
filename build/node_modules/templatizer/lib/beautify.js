var uglifyjs = require('uglify-js');


module.exports = function (code) {
    return uglifyjs.parse(code).print_to_string({beautify: true});
};