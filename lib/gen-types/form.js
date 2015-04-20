var fs = require('fs');
var _ = require('lodash');
var esprima = require('esprima');
var processTemplate = require('../helpers/process-template');

var formTemplate = fs.readFileSync(__dirname + '/../templates/form.js', 'utf8');
var inputTemplate = fs.readFileSync(__dirname + '/../templates/input.js', 'utf8');
var arrayInputTemplate = fs.readFileSync(__dirname + '/../templates/array-input.js', 'utf8');
var selectInputTemplate = fs.readFileSync(__dirname + '/../templates/select-input.js', 'utf8');
var checkboxInputTemplate = fs.readFileSync(__dirname + '/../templates/checkbox-input.js', 'utf8');

var defaultModel = ['var BaseModel = Model.extend({',
'    props: {id: \'string\'}',
'});'].join('\n');

module.exports = function(opts, cb) {
    opts = opts || {};
    var output = {};

    // build out our config
    var config = _.extend({
        model: (opts.modelpath) ? fs.readFileSync(opts.modelpath, 'utf8') : defaultModel,
        formtemplate: formTemplate,
        inputtemplate: inputTemplate,
        selecttemplate: selectInputTemplate,
        checkboxtemplate: checkboxInputTemplate,
        arrayinputtemplate: arrayInputTemplate
    }, opts);

    var fieldMap = {
        string: function(field) {
            requires.InputView = 'ampersand-input-view';
            return '            ' + processTemplate(config.inputtemplate, field).trim();
        },
        array: function(field) {
            requires.ArrayInputView = 'ampersand-array-input-view';
            return '            ' + processTemplate(config.arrayinputtemplate, field).trim();
        },
        boolean: function(field) {
            requires.CheckboxView = 'ampersand-checkbox-view';
            return '            ' + processTemplate(config.checkboxtemplate, field).trim();
        },
        select: function(field) {
            requires.SelectView = 'ampersand-select-view';
            return '            ' + processTemplate(config.selecttemplate, field).trim();
        }
    };

    fieldMap.number = fieldMap.string;

    var requires = {};

    // parse our JS
    var ast = esprima.parse(config.model);

    _.each(ast.body, function(item) {
        if (item.type === 'ExpressionStatement') {
            try {
                // last argument to `extend`
                var objectProperties = _.last(item.expression.right.arguments).properties;
                // get props
                var props = _.find(objectProperties, function(value) {
                    return value.type === 'Property' && value.key.name === 'props';
                });
                props = props.value.properties;

                // handle different ways of providing types
                _.each(props, function(prop) {
                    var def = output[prop.key.name] = {};
                    if (prop.value.type === 'Literal') {
                        def.type = prop.value.value;
                    } else if (prop.value.type === 'ArrayExpression') {
                        def.type = prop.value.elements[0].value;
                    } else if (prop.value.type === 'ObjectExpression') {
                        _.find(prop.value.properties, function(prop) {
                            if (prop.type === 'Property' && prop.key.name === 'type') {
                                def.type = prop.value.value;
                            }
                            if (prop.type === 'Property' && prop.key.name === 'values') {
                                def.type = 'select';
                                def.options = _.map(prop.value.elements, function(element) {
                                    return element.raw;
                                });
                            }
                        });
                    }
                });
            } catch (e) {}
        }
    });

    var buff = [];

    _.each(output, function(definition, key) {
        var func = fieldMap[definition.type];
        if (func) {
            buff.push(func({
                name: key,
                label: toLabel(key),
                required: !!definition.required,
                options: definition.options
            }));
        }
    });

    var requireString = _.reduce(requires, function(buff, value, key) {
        return buff += 'var ' + key + ' = require(\'' + value + '\');\n';
    }, '');

    // make a string
    buff = buff.join(',\n');

    console.log('\nYou can install required views by running:\n$ npm install ' + _.values(requires).join(' ') + ' --save');

    cb(null, processTemplate(config.formtemplate, {
        fields: buff,
        requires: requireString
    }));
};


var toLabel = function(string) {
    return separateWords(pascalize(string), ' ');
};

var separateWords = function(string, separator) {
    if (separator === undefined) {
        separator = '_';
    }
    return string.replace(/([a-z])([A-Z0-9])/g, '$1' + separator + '$2');
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
