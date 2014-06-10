module.exports = function getStdin(cb) {
    if (process.stdin.isTTY) return cb('');
    var buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function() {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            buf += chunk.toString();
        }
    });
    process.stdin.on('end', function() {
        cb(buf)
    });
}
