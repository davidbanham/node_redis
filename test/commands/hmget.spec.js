var assert = require("assert");
var config = require("../lib/config");
var helper = require("../helper");
var redis = config.redis;

describe("The 'hmget' method", function () {

    helper.allTests(function(parser, ip, args) {

        describe("using " + parser + " and " + ip, function () {
            var client;
            var hash = 'test hash';

            beforeEach(function (done) {
                client = redis.createClient.apply(redis.createClient, args);
                client.once("error", done);
                client.once("connect", function () {
                    client.flushdb();
                    client.HMSET(hash, {"0123456789": "abcdefghij", "some manner of key": "a type of value"}, helper.isString('OK'));
                    return done();
                });
            });

            it('allows keys to be specified using multiple arguments', function (done) {
                client.HMGET(hash, "0123456789", "some manner of key", function (err, reply) {
                    assert.strictEqual("abcdefghij", reply[0].toString());
                    assert.strictEqual("a type of value", reply[1].toString());
                    return done(err);
                });
            });

            it('allows keys to be specified by passing an array', function (done) {
                client.HMGET(hash, ["0123456789", "some manner of key"], function (err, reply) {
                    assert.strictEqual("abcdefghij", reply[0].toString());
                    assert.strictEqual("a type of value", reply[1].toString());
                    return done(err);
                });
            });

            it('allows keys to be specified by passing an array as first argument', function (done) {
                client.HMGET([hash, "0123456789", "some manner of key"], function (err, reply) {
                    assert.strictEqual("abcdefghij", reply[0].toString());
                    assert.strictEqual("a type of value", reply[1].toString());
                    return done(err);
                });
            });

            it('allows a single key to be specified in an array', function (done) {
                client.HMGET(hash, ["0123456789"], function (err, reply) {
                    assert.strictEqual("abcdefghij", reply[0].toString());
                    return done(err);
                });
            });

            it('allows keys to be specified that have not yet been set', function (done) {
                client.HMGET(hash, "missing thing", "another missing thing", function (err, reply) {
                    assert.strictEqual(null, reply[0]);
                    assert.strictEqual(null, reply[1]);
                    return done(err);
                });
            });

            afterEach(function () {
                client.end();
            });
        });
    });
});
