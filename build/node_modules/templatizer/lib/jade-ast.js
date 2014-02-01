var esprima = require('esprima');
var escodegen = require('escodegen');
var beautify = require('./beautify');
var _ = require('underscore');

// RegEx that identifies the name of a jade mixin fn
var rIsMixin = /_mixin$/;

// Determine if an expression from an AST
// is a call to a jade mixin
var isMixinCall = function (expression) {
    var sExprType = expression && expression.type,
        sCallee = expression && expression.callee,
        sCalleeName = sCallee && sCallee.name;
    return sExprType === 'CallExpression' && rIsMixin.test(sCalleeName);
};

// Traverse an AST with access to the node and
// the parent node during traversal
var traverse = function (node, func, parent) {
    func(node, parent);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {
                if (Array.isArray(child)) {
                    child.forEach(function (arrayNode) {
                        traverse(arrayNode, func, node);
                    });
                } else {
                    traverse(child, func, node); //6
                }
            }
        }
    }
};

// Will traverse all mixin calls in a tree
// and transform all of them
var transformAllMixins = function (tree, ns) {
    traverse(tree, function (node, parent) {
        if (node.type === 'CallExpression' && node.callee && rIsMixin.test(node.callee.name)) {
            // transform the call to the mixin fn and namespace it on this[ns]
            parent = transformMixinCall(parent, ns);
        }
    });
};


// Will transform a jade mixin fn call to
// a call to our mixin on the parent template namespace
var transformMixinCall = function (statement, ns) {

    if (isMixinCall(statement.expression)) {

        var oldName = statement.expression.callee.name;
        var oldArgs = statement.expression.arguments;
        var newName = oldName.replace(rIsMixin, '');
        var newCallee;

        // Make the mixin call as an argument to buf.push
        statement.expression.callee = {
            type: 'MemberExpression',
            computed: false,
            object: {
                type: 'Identifier',
                name: 'buf'
            },
            property: {
                type: 'Identifier',
                name: 'push'
            }
        };

        // Add our altered mixin name to our ns array
        ns = ns.split('.').concat(newName);

        // Loop through and build the namespaced callee
        for (var i = 1, l = ns.length; i < l; i++) {
            newCallee = JSON.stringify({
                type: 'MemberExpression',
                computed: false,
                object: i === 1 ? {
                    type: 'Identifier',
                    name: ns[i - 1]
                } : JSON.parse(newCallee),
                property: {
                    type: 'Identifier',
                    name: ns[i]
                }
            });
        }

        // Add namespaced callee as the argument
        statement.expression.arguments = [{
            type: 'CallExpression',
            callee: JSON.parse(newCallee),
            arguments: oldArgs
        }];
    }

    return statement;
};

module.exports.renameFunc = function (func, name) {
    var ast = esprima.parse(func);
    ast.body[0].id.name = 'tmpl_' + name.replace(/[^A-Za-z0-9]/g, '_');
    return escodegen.generate(ast);
};

module.exports.getMixins = function (options) {
    var ast = esprima.parse(options.template);
    var dirString = options.dirString;
    var parentObjName = options.parentObjName;
    var name = options.templateName;
    var astBody = ast.body[0].body.body;
    var mixinOutput = '';
    var removeDeclarations = [];
    var outputTemplate = options.template;

    astBody.forEach(function (tree, treeI) {
        // clone the tree so as to modify in place
        var cloneTree = JSON.parse(JSON.stringify(tree)),
            type = cloneTree.type,
            declarationName = cloneTree.declarations && cloneTree.declarations[0].id.name,
            statements = [],
            fnTree = {},
            generatedMixinFn = '';

        if (type === 'VariableDeclaration' && rIsMixin.test(declarationName)) {
            // It's a mixin so we'll make our changes and mark the index for removal
            removeDeclarations.push(treeI);
            // Get mixin function from variable declaration
            fnTree = cloneTree.declarations[0].init;

            // Change to an anonymous function to be assigned later
            fnTree.type = 'FunctionDeclaration';
            fnTree.id = {
                type: 'Identifier',
                name: 'tmpl_' + dirString.replace(/[^A-Za-z0-9]/g, '_') + '_' + declarationName
            };
            statements = fnTree.body.body;

            // Replace calls to other mixins within the file
            transformAllMixins(statements, parentObjName + '.' + dirString);

            // Add a variable declaration for the buf array
            // since that was previously handled by jade
            statements[0].declarations.push({
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name: 'buf'
                },
                init: {
                    type: 'ArrayExpression',
                    elements: []
                }
            });
            // return the buf array
            statements.push({
                type: 'ReturnStatement',
                argument: {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'buf'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'join'
                        }
                    },
                    arguments: [
                        {
                            type: 'Literal',
                            value: '',
                            raw: '""'
                        }
                    ]
                }
            });

            // Generate fn and store until it can be added to output after main fn
            generatedMixinFn = beautify(escodegen.generate(fnTree));
            mixinOutput += [
                '',
                '// ' + dirString.replace(/\./g, '/') + '.jade:' + declarationName + ' compiled template',
                '' + parentObjName + '["' + dirString.replace(/\./g, '"]["') + '"]["' + declarationName.replace(rIsMixin, '').replace(/\./g, '"]["') + '"] = ' + generatedMixinFn + ';',
                ''
            ].join('\n');
        }
    });

    if (removeDeclarations.length) {
        // Remove mixin declarations
        var len = removeDeclarations.length;
        while (len--) {
            astBody.splice(removeDeclarations[len], 1);
        }

        // Traverse and replace mixin calls with buf.push(exports[dirString][mixin]())
        transformAllMixins(ast, parentObjName + '.' + dirString);

        // Regenerate our template function
        outputTemplate = beautify(escodegen.generate(ast));
    }

    return {mixins: mixinOutput, template: outputTemplate};
};