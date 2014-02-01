var b = require('browserify')(),
    fs = require('fs');


b.add('./clientconfig.js');
b.bundle({standalone: 'clientconfig'}, function (err, code) {
    fs.writeFileSync('clientconfig.bundle.js', code);
});
