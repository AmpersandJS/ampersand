// Load modules

var Redis = require('redis');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.Connection = internals.Connection = function (options) {

    Hoek.assert(this.constructor === internals.Connection, 'Redis cache client must be instantiated using new');

    this.settings = options;
    this.client = null;
    return this;
};


internals.Connection.prototype.start = function (callback) {

    var self = this;
    if (this.client) {
        return callback();
    }

    this.client = Redis.createClient(this.settings.port, this.settings.host);

    if (this.settings.password) {
        this.client.auth(this.settings.password);
    }

    // Listen to errors

    var wasHandled = false;

    this.client.on('error', function (err) {

        if (wasHandled === false) {
            wasHandled = true;
            self.client = null;                                                     // Set to null so that Connnection.isReady returns false
            return callback(err);
        }
    });

    // Wait for connection

    this.client.on('connect', function () {

        if (wasHandled === false) {
            wasHandled = true;
            return callback();
        }
    });
};


internals.Connection.prototype.stop = function () {

    if (this.client) {
        this.client.removeAllListeners();
        this.client.quit();
        this.client = null;
    }
};


internals.Connection.prototype.isReady = function () {

    return (!!this.client);
};


internals.Connection.prototype.validateSegmentName = function (name) {

    if (!name) {
        return new Error('Empty string');
    }

    if (name.indexOf('\0') !== -1) {
        return new Error('Includes null character');
    }

    return null;
};


internals.Connection.prototype.get = function (key, callback) {

    if (!this.client) {
        return callback(new Error('Connection not started'));
    }

    this.client.get(this.generateKey(key), function (err, result) {

        if (err) {
            return callback(err);
        }

        if (!result) {
            return callback(null, null);
        }

        var envelope = null;
        try {
            envelope = JSON.parse(result);
        }
        catch (err) { }     // Handled by validation below

        if (!envelope) {
            return callback(new Error('Bad envelope content'));
        }

        if (!envelope.item ||
            !envelope.stored) {

            return callback(new Error('Incorrect envelope structure'));
        }

        return callback(null, envelope);
    });
};


internals.Connection.prototype.set = function (key, value, ttl, callback) {

    var self = this;

    if (!this.client) {
        return callback(new Error('Connection not started'));
    }

    var envelope = {
        item: value,
        stored: Date.now(),
        ttl: ttl
    };

    var cacheKey = this.generateKey(key);

    var stringifiedEnvelope = null;

    try {
        stringifiedEnvelope = JSON.stringify(envelope);
    }
    catch (err) {
        return callback(err);
    }

    this.client.set(cacheKey, stringifiedEnvelope, function (err) {

        if (err) {
            return callback(err);
        }

        var ttlSec = Math.max(1, Math.floor(ttl / 1000));
        self.client.expire(cacheKey, ttlSec, function (err) {        // Use 'pexpire' with ttl in Redis 2.6.0

            return callback(err);
        });
    });
};


internals.Connection.prototype.drop = function (key, callback) {

    if (!this.client) {
        return callback(new Error('Connection not started'));
    }

    this.client.del(this.generateKey(key), function (err) {

        return callback(err);
    });
};


internals.Connection.prototype.generateKey = function (key) {

    return encodeURIComponent(this.settings.partition) + ':' + encodeURIComponent(key.segment) + ':' + encodeURIComponent(key.id);
};