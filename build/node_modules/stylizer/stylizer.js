var stylus = require('stylus');
var fs = require('fs');
var path = require('path');
var prequire = require('parent-require');
var util = require('util');
var cssesc = require('cssesc');

var makeCSSPath = function (stylFile) {
    var dir = path.dirname(stylFile);
    var filename = path.basename(stylFile, path.extname(stylFile));
    return path.join(dir, filename + '.css');
};


// Can be called as
// infile, outfile, done
// infile, outfile, plugins, done
// options, done
module.exports = function (infile, outfile, plugins, done) {
    var options;
    var development = false; //by default

    // When called as (options, done) [recommended]
    if (arguments.length === 2 && typeof infile === 'object' && typeof outfile === 'function') {
        options = infile;
        done = outfile;

        if (!options.infile) throw 'infile option required';
        infile = options.infile;

        outfile = options.outfile || makeCSSPath(infile);
        plugins = options.plugins || [];
        development = options.development || development;
    }

    // When called as (infile, outfile, callback)
    if (arguments.length == 3 && typeof plugins === 'function') {
        done = plugins;
        plugins = [];
    }

    var styl = fs.readFileSync(infile);


    var compiler = stylus(styl.toString())
                    .set('paths', [ path.dirname(infile) ])
                    .set('include css', true);

    if (util.isArray(plugins)) {
        plugins.forEach(function (plugin) {
            var p = prequire(plugin);
            compiler.use(p());
        });
    } else {
        Object.keys(plugins).forEach(function (plugin) {
            var p = prequire(plugin);
            compiler.use(p(plugins[plugin]));
        });
    }

    compiler.render(function (err, css) {
        var errMessage;

        if (err) {
            if (!development) {
                return done(err);
            } else {
                errMessage = cssesc("Stylizer error: \n\n" + err.message, { escapeEverything: true });
                css = fs.readFileSync(path.join(__dirname, 'error.css')).toString();
                css += 'body:before { content: "' + errMessage + '"; }';
            }
        }

        fs.writeFile(outfile, css, done);
    });
};
