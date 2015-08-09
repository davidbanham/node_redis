var assert = require("assert");
var config = require("../../lib/config");
var crypto = require("crypto");
var nodeAssert = require("../../lib/nodeify-assertions");
var redis = config.redis;
var RedisProcess = require("../../lib/redis-process");

describe("The 'hset' method", function () {

    var rp;
    before(function (done) {
        RedisProcess.start(function (err, _rp) {
            rp = _rp;
            return done(err);
        });
    })

    function allTests(parser, ip) {
        var args = config.configureClient(parser, ip);

        describe("using " + parser + " and " + ip, function () {
            var client;
            var hash = 'test hash';

            beforeEach(function (done) {
                client = redis.createClient.apply(redis.createClient, args);
                client.once("error", done);
                client.once("connect", function () {
                    client.flushdb(done);
                });
            });

            it('allows a value to be set in a hash', function (done) {
                var field = new Buffer("0123456789");
                var value = new Buffer("abcdefghij");

                client.HSET(hash, field, value, nodeAssert.isNumber(1));
                client.HGET(hash, field, nodeAssert.isString(value.toString(), done));
            });

            it('handles an empty value', function (done) {
                var field = new Buffer("0123456789");
                var value = new Buffer(0);

                client.HSET(hash, field, value, nodeAssert.isNumber(1));
                client.HGET([hash, field], nodeAssert.isString("", done));
            });

            it('handles empty key and value', function (done) {
                var field = new Buffer(0);
                var value = new Buffer(0);
                client.HSET([hash, field, value], function (err, res) {
                    assert.strictEqual(res, 1);
                    client.HSET(hash, field, value, nodeAssert.isNumber(0, done));
                });
            });

            afterEach(function () {
                client.end();
            });
        });
    }

    ['javascript', 'hiredis'].forEach(function (parser) {
        allTests(parser, "/tmp/redis.sock");
        ['IPv4', 'IPv6'].forEach(function (ip) {
            allTests(parser, ip);
        })
    });

    after(function (done) {
      if (rp) rp.stop(done);
    });
});
