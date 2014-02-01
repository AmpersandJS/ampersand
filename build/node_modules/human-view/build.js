var bundle = require('browserify')();
var fs = require('fs');
var uglify = require('uglify-js');
var pack = require('./package.json');

var bower = {
  name: pack.name,
  version: pack.version,
  main: pack.main,
  dependencies: pack.dependencies
};

fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

bundle.add('./human-view');
bundle.bundle({standalone: 'HumanView'}, function (err, source) {
  'use strict';
  if (err) console.error(err);
  fs.writeFile('human-view.min.js', uglify.minify(source, {fromString: true}).code, function (err) {
    if (err) throw err;
  });
});
