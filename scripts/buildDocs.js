var fs = require('fs');
var jade = require('jade');
var path = require('path');


jade.renderFile(path.normalize(__dirname + '/../index.jade'), {}, function (err, html) {
    if (err) throw err;
    fs.writeFileSync(path.normalize(__dirname + '/../index.html'), html);
    console.log('built index.html');
});
