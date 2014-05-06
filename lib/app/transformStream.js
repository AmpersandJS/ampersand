var fs = require('fs'),
    stream = require('stream'),
    stream2 = require('readable-stream'),
    processString = require('./processString'),
    Transform = stream.Transform || stream2.Transform;

function EncodeStream(data) {
    this.templateData = data;
    Transform.call(this);
}

EncodeStream.prototype = Object.create(Transform.prototype, { constructor: { value: EncodeStream } });

EncodeStream.prototype._transform = function (chunk, encoding, callback) {
    chunk = chunk.toString();
    this.push(processString(chunk, this.templateData));
    callback();
};

module.exports = EncodeStream;
