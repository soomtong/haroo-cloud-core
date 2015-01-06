var supertest = require('supertest');
var app = require('../app');

var assert = require("assert");

describe('Route', function () {
    it('there are app mode', function () {
        assert.ok(app.node_env == 'development' || app.node_env == 'production');
    });
    it('test route for testing', function () {
        var result = {msg: 'hi'};
        app.route(app.node_env, function (server) {
            supertest(server)
                .get('/testing')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.deepEqual(res.body, result);
                });
        });
    });
});
