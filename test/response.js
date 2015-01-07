var assert = require("assert");

var response = require('../lib/response');

describe('Response', function () {
    it('simple response check', function () {
        var expected = {
            message: 'OK: hello world',
            data: {name: 'haroo-cloud-core'},
            isResult: true,
            output: {
                statusCode: 200,
                meta: {error: 'OK', message: 'hello world'}
            }
        };
        var result = response.create(200, 'hello world', {name: 'haroo-cloud-core'});

        assert.deepEqual(result, expected);
    });

    it('custom message response', function () {
        var expected = {
            message: 'OK: hello world',
            data: null,
            isResult: true,
            output: {
                statusCode: 200,
                meta: {error: 'OK', message: 'hello world'}
            }
        };
        var result = response.create(200, 'hello world');

        assert.deepEqual(result, expected);
    });

    it('simple wrapper for Http result', function () {
        var error = response.badRequest();
        var wrapped = response.wrap(error);

        assert.deepEqual(error, wrapped);
    });

    it('simple wrapper for custom result', function () {
        var result = response.create(100, 'hello world');
        var wrapped = response.wrap(result, 100, 'hello world');

        assert.deepEqual(result, wrapped);
    });

    it('simple wrapper for custom done result', function () {
        var result = response.create(200, 'hello world', {name: 'haroo-cloud-core'});
        var done = response.done('hello world', {name: 'haroo-cloud-core'});

        assert.deepEqual(result, done);
    });
});
