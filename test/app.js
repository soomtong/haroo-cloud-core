var supertest = require('supertest');
var app = require('../app');

var assert = require("assert");

describe('Application', function () {
    it('there are app mode', function () {
        assert.ok(app.mode == 'development' || app.mode == 'production');
    });
    it('test route for testing', function () {
        var result = {msg: 'hi'};
        app.route(app.mode, function (server) {
            supertest(server)
                .get('/testing')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.deepEqual(res.body, result);
                });
        });
    });
    describe('Check configuration', function () {
        it('should exist config.js file', function () {
            assert(true);
        });
    });
});