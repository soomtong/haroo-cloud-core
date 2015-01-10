var assert = require("assert");

var supertest = require('supertest');
var app = require('../app');

describe('Account', function () {

    it('create account by with no email', function (done) {
        var result = {
            status: 'validation failed',
            errors: [{
                field: 'email',
                code: 'MISSING',
                message: 'Field is required'
            }]
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it('create account by with no password', function (done) {
        var result = {
            status: 'validation failed',
            errors: [{
                field: 'password',
                code: 'MISSING',
                message: 'Field is required'
            }]
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({email: 'test@email.net'})
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it('create account by email, password and optional nickname', function (done) {
        var result = {
            message: 'OK: created account',
            data: {
                email: 'test@email.net',
                password: 'new_password',
                accessIP: '127.0.0.1',
                database: 'db1.haroopress.com'
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'created account'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({email: 'test@email.net', password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });
});