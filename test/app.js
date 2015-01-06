var fs = require('fs');
var assert = require("assert");
var supertest = require('supertest');

describe('Application', function () {
    var app = require('../app');

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
    describe('Check configuration', function () {
        var config = require('../lib/config');
        var server = config({mode: app.node_env})['server'];

        it('should exist config.js file', function () {
            fs.open('config.json', 'r', function (err, fd) {
                assert.ok(!err, 'should exist "config.json" file');
                fs.close(fd);
            });
        });
        it('there is a specified port number', function () {
            assert.ok(server.port > 0);
        })
    });
});