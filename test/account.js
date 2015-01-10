var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

//todo: set app mode
//app.node_env = 'testing';

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
            message: 'OK: '+i18n.t('account.create.done'),
            data: {
                "access_token": "e8e58304-dd29-4c03-8791-673e96a7f34e",
                "db_host": "db1.haroopress.com",
                "email": "test@email.net",
                "haroo_id": "b090e563d9c725ea48933efdeaa348fb4",
                "login_expire": "1422208905667",
                "profile": {
                    "gender": "",
                    "location": "",
                    "picture": "",
                    "website": ""
                }, "tokens": []

            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: i18n.t('account.create.done')}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({email: 'test@email.net', password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    //assert.deepEqual(res.body, result);
                    assert.deepEqual(res.body.data.db_host, result.data.db_host);
                    assert.deepEqual(res.body.data.haroo_id, result.data.haroo_id);
                    //assert.deepEqual(res.body.message, result.message);

                    done();
                });
        });
    });
});