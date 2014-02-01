var stylizer = require('../../stylizer');
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');

var tests = {};
var fixtures = path.join(__dirname, 'fixtures');
var testfile = path.join(__dirname, 'files', 'test.css');

var test = function (name, fn) {
    tests[name] = function () {
        try {
            fs.unlinkSync(testfile);
        } catch (e) {
        }
        fn.apply(this, arguments);
    };
};

// No plugins
assert.cssMatch = function (actual, expected) {
    expected = fs.readFileSync(expected).toString();
    actual = fs.readFileSync(actual).toString();
    assert.equal(expected, actual);
};

test('No plugins array', function (cb) {
    var infile = path.join(fixtures, 'simple.styl');
    var expected = path.join(fixtures, 'simple_expected.css');
    stylizer(infile, testfile, function (err) {
        assert.cssMatch(testfile, expected);
        cb();
    });
});

test('Empty plugins array', function (cb) {
    var infile = path.join(fixtures, 'simple.styl');
    var expected = path.join(fixtures, 'simple_expected.css');
    stylizer(infile, testfile, [], function (err) {
        assert.cssMatch(testfile, expected);
        cb();
    });
});

test('Nib plugin', function (cb) {
    var infile = path.join(fixtures, 'withnib.styl');
    var expected = path.join(fixtures, 'withnib_expected.css');
    stylizer(infile, testfile, ['nib'], function (err) {
        assert.cssMatch(testfile, expected);
        cb();
    });
});


test('Option format', function (cb) {
    var infile = path.join(fixtures, 'withnib.styl');
    var expected = path.join(fixtures, 'withnib_expected.css');
    stylizer({
        infile: infile,
        outfile: testfile,
        plugins: ['nib']
    }, function (err) {
        assert.cssMatch(testfile, expected);
        cb();
    });
});


test('With error in developmnt', function (cb) {
    var infile = path.join(fixtures, 'witherror.styl');
    var expected = path.join(__dirname, '..', 'error.css');
    stylizer({
        infile: infile,
        outfile: testfile,
        development: true
    }, function (err) {
        assert.ifError(err);

        var basicExpectedCSS = fs.readFileSync(expected).toString();
        var actualCSS = fs.readFileSync(testfile).toString();

        var basicActualCSS = actualCSS.split("\n").slice(0,11).join("\n") + "\n";
        var customActualCSS = actualCSS.split("\n")[11];

        assert.equal(basicActualCSS, basicExpectedCSS, 'Basic error styling should equal the template');
        assert.ok(/content\:/.test(customActualCSS), 'Should have error content appended');

        cb();
    });
});


test('With error', function (cb) {
    var infile = path.join(fixtures, 'witherror.styl');
    var expected = path.join(__dirname, '..', 'error.css');
    stylizer({
        infile: infile,
        outfile: testfile,
        development: false
    }, function (err) {
        assert(err, 'Should be an error');
        cb();
    });
});



async.series(tests, function (err, results) {
    if (err) throw err;

    console.log('All tests passed');
});
