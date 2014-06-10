var fs = require('fs');
var _ = require('underscore');
var humps = require('humps');
var esprima = require('esprima');
var processTemplate = require('../helpers/process-template');
var formTemplate = fs.readFileSync(__dirname + '/../templates/form.js', 'utf8');
var inputTemplate = fs.readFileSync(__dirname + '/../templates/input.js', 'utf8');


var defaultModel = ["var BaseModel = Model.extend({",
"    props: {id: 'string'}",
"});"].join('\n');

module.exports = function (opts, cb) {
    opts || (opts = {});
    var name = opts.name;
    //var fileName = humps.decamelize(name, '-');
    var output = {};

    console.log(opts.modelpath);

    // build out our config
    var config = _.extend({
        model: (opts.modelpath) ? fs.readFileSync(opts.modelpath, 'utf8') : defaultModel,
        formtemplate: formTemplate,
        inputtemplate: inputTemplate
    }, opts);

    var fieldMap = {
        string: function (field) {
            return '            ' + processTemplate(config.inputtemplate, field).trim();
        }
    };

    // parse our JS
    var ast = esprima.parse(config.model);

    var mainExport = _.find(ast.body, function (item) {

        if (item.type === 'ExpressionStatement') {
            var path = 'item.expression.right';
            try {
                // last argument to `extend`
                var objectProperties = _.last(item.expression.right.arguments).properties;
                // get props
                var props = _.find(objectProperties, function (value) {
                    return value.type === 'Property' && value.key.name === 'props';
                });
                var props = props.value.properties;

                // handle different ways of providing types
                _.each(props, function (prop) {
                    var def = output[prop.key.name] = {};
                    if (prop.value.type === 'Literal') {
                        def.type = prop.value.value;
                    } else if (prop.value.type === 'ArrayExpression') {
                        def.type = prop.value.elements[0].value;
                        if (prop.value.elements[2]) {
                            console.log('WATH!', prop.value.elements[2]);
                        }
                    } else if (prop.value.type === 'ObjectExpression') {
                        _.find(prop.value.properties, function (prop) {
                            if (prop.type === 'Property' && prop.key.name === 'type') {
                                def.type = prop.value.value;
                            }
                            if (prop.type === 'Property' && prop.key.name === 'default') {
                                def.default = prop.value.value
                            }
                        });
                    }
                });

                console.log(output);

            } catch (e) {}

        }
    })

    var buff = [];

    _.each(output, function (definition, key) {
        var func = fieldMap[definition.type];
        if (func) {
            buff.push(func({
                name: key,
                label: toLabel(key),
                required: !!definition.required
            }));
        }
    });



    // make a string
    buff = buff.join(',\n');

    cb(null, processTemplate(config.formtemplate, {fields: buff}));
};


var toLabel = function (string) {
    return separateWords(pascalize(string), ' ');
};

var separateWords = function(string, separator) {
    if (separator === undefined) {
        separator = '_';
    }
    return string.replace(/([a-z])([A-Z0-9])/g, '$1'+ separator +'$2');
};

var camelize = function(string) {
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.replace(/^([A-Z])/, function(match, chr) {
        return chr ? chr.toLowerCase() : '';
    });
};

var pascalize = function(string) {
    return camelize(string).replace(/^([a-z])/, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
    });
};

