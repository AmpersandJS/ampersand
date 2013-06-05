var fs = require('fs'),
    stream = require('stream'),
    stream2 = require('readable-stream'),
    Transform = stream.Transform || stream2.Transform;

function EncodeStream(options) {
    Transform.call(this, options);
}

EncodeStream.prototype = Object.create(Transform.prototype, { constructor: { value: EncodeStream } });

EncodeStream.prototype._transform = function (chunk, encoding, callback) {
    chunk = chunk.toString();
    this.push(chunk.toUpperCase());
    callback();
};

module.exports = EncodeStream;
