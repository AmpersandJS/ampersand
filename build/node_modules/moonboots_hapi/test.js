#!/usr/bin/env node

var nodeunit = require('nodeunit');
var reporter = nodeunit.reporters['default'];

if (process.env.NODE_ENV !== 'test') {
    process.stderr.write('Will only run from test environment\n');
    process.exit(1);
}

reporter.run(['./tests/routes.js', './tests/multiapp.js', './tests/defaults.js']);
