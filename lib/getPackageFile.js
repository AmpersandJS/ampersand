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
}

// our list of dependencies for each
var deps = {
    express: {
        "express": "3.x.x",
        "jade": "1.x.x",
        "helmet": "0.1.2",
        "moonboots": "1.x.x"
    },
    hapi: {
        "hapi": "2.x.x",
        "moonboots_hapi": "1.x.x"
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
