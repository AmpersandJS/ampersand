var fs = require('fs'),
    stream = require('stream'),
    stream2 = require('readable-stream'),
    Transform = stream.Transform || stream2.Transform;

function EncodeStream(data) {
    this.templateData = data;
    Transform.call(this);
}

EncodeStream.prototype = Object.create(Transform.prototype, { constructor: { value: EncodeStream } });

EncodeStream.prototype._transform = function (chunk, encoding, callback) {
    var self = this;
    chunk = chunk.toString();
    this.push(chunk.replace(/\{\{\{(\w+)\}\}\}/g, function (match, p1) {
        var value = self.templateData[p1];
        return value || match;
    }));
    callback();
};

module.exports = EncodeStream;
