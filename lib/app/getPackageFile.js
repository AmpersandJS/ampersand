var fs = require('fs');


// returns populated JS structure for package.json file based on options
module.exports = function (config) {
    // do this each time to avoid any issues with caching
    var frameworkDeps = deps[config.framework];
    var pack = JSON.parse(fs.readFileSync(__dirname + '/templatePackage.json', {encoding: 'utf8'}));
    var key;

    // extend our dependencies
    for (key in frameworkDeps) {
        pack.dependencies[key] = frameworkDeps[key];
    }

    // set name and author (if provided)
    pack.name = config.machineName;
    if (config.author) {
        pack.author = config.author;
    } else {
        delete pack.author;
    }

    // sort object keys alphabetically
    pack.dependencies = sortObjectKeysAlphabetically(pack.dependencies);
    pack.devDependencies = sortObjectKeysAlphabetically(pack.devDependencies);
    pack.jshintConfig = sortObjectKeysAlphabetically(pack.jshintConfig);

    return pack;
};

// our list of dependencies for each
var deps = {
    express: {
        "body-parser": "^1.4.3",
        "compression": "^1.0.8",
        "cookie-parser": "^1.3.2",
        "express": "^4.6.1",
        "helmet": "^0.3.2",
        "jade": "^1.3.1",
        "moonboots-express": "^0.1.1",
        "semi-static": "^0.0.5",
        "serve-static": "^1.3.2"
    },
    hapi: {
        "hapi": "^8.0.0",
        "moonboots_hapi": "^4.0.0"
    }
};


// because I'm anal
function sortObjectKeysAlphabetically(object) {
    var sorted = {};
    Object.keys(object).sort().forEach(function (key) {
        sorted[key] = object[key];
    });
    return sorted;
}
