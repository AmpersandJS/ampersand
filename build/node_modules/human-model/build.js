var fs = require('fs');
var uglify = require('uglify-js');
var pack = require('./package.json');

var bower = {
  name: pack.name,
  version: pack.version,
  main: pack.main,
  dependencies: pack.dependencies
};

// build our bower package
fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

// build minified file
fs.writeFileSync('human-model.min.js', uglify.minify('human-model.js').code);
