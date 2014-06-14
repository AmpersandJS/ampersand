var esprima = require('esprima');
var escodegen = require('escodegen');
var repeat = require('repeat-string');


module.exports = function (code, config) {
    var ast = esprima.parse(code, {raw: true, tokens: true, range: true, comment: true});
    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
    code = escodegen.generate(ast, {
        comment: true,
        format: {
            indent: {
                style: config.useTabs ? '\t' : repeat(' ', config.indent),
                base: 0,
                adjustMultilineComment: true
            },
            quotes: config.quotes
        },

    });

    // ensures spacing of require statements
    var split = code.split('\n');
    var varDec = /^[(var)(\/\/)(\/\*.*\*\/)]/;
    var lineNum = 0;
    var inMultiComment = false;
    var multiCommentStart = /\/\*/;
    var multiCommentEnd = /\*\//;

    split.some(function (line, index) {
        if (!varDec.test(line) && !inMultiComment) {
            lineNum = index;
            return true;
        } else {
            if (inMultiComment) {
                if (multiCommentEnd.test(line)) {
                    inMultiComment = false;
                }
            } else if (multiCommentStart.test(line)) {
                inMultiComment = true;
            }
        }
    });

    split.splice(lineNum, 0, '', '');

    return split.join('\n');
}
