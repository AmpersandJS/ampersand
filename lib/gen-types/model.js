var fs = require('fs');
var _ = require('lodash');
var repeat = require('repeat-string');
var processTemplate = require('../helpers/process-template');
var collectionTemplate = fs.readFileSync(__dirname + '/../templates/collection.js', 'utf8');
var modelTemplate = fs.readFileSync(__dirname + '/../templates/model.js', 'utf8');


module.exports = function(opts, cb) {
    opts || (opts = {});
    var name = opts.name;
    var fileName = _.kebabCase(name);

    // build out our config
    var config = _.extend({
        fileName: fileName,
        collectionFileName: fileName + '-collection',
        reqPath: 'ampersand-model',
        collectionTemplate: collectionTemplate,
        modelTemplate: modelTemplate,
        data: {
            id: 'something'
        }
    }, opts);

    var obj = findObj(config.data);
    var idKey = findId(obj);
    var result = {};

    // figure out our indent string
    config.indentString = (function() {
        if (config.useTabs) return '\t';
        return repeat(' ', config.indent);
    })();

    // sort with ID first
    var sorted = {};
    if (idKey) {
        sorted[idKey] = obj[idKey];
    }
    obj = _.extend(sorted, obj);

    // generate property definitions
    config.props = getProps(obj);

    if (!config.url) config.url = '/api/' + config.fileName;

    result.name = name;
    result.modelFileName = config.fileName + '.js';
    result.collectionFileName = config.collectionFileName + '.js';
    result.collection = processTemplate(config.collectionTemplate, config);
    result.model = processTemplate(config.modelTemplate, config);

    cb(null, result);
};


function getProps(obj) {
    var buf = [];
    var indent = repeat(' ', 8);
    var keys = _.keys(obj);
    var length = keys;
    _.each(keys, function(key, index) {
        var val = obj[key];
        var res;
        if (_.isString(val)) {
            res = '[\'string\']';
        } else if (_.isArray(val)) {
            res = '[\'array\']';
        } else if (_.isNumber(val)) {
            res = '[\'number\']';
        } else if (_.isBoolean(val)) {
            res = '[\'boolean\']';
        } else {
            res = '[\'object\']';
        }
        buf.push(indent + key + ': ' + res);
    });
    return buf.join(',\n');
}

var idNames = ['id', '_id', 'ID', '_ID', 'primary'];

function findId(obj) {
    var keys = _.keys(obj);
}

function findObj(input) {
    if (typeof input === 'string') {
        input = JSON.parse(input);
    }
    if (_.isArray(input)) {
        return findObj(input[0]);
    } else {
        return input;
    }
}
