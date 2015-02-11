var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Document', function () {

    var dummyAccount;       // for internal use only

    before(function(done){
        var Account = require('../core/models/account');

        Account.remove({email: 'test@email.net'}, function (err, result) {
            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/api/account/create')
                    .set('x-access-host', 'supertest')
                    .send({email: 'test@email.net', password: 'new_password'})
                    .expect('Content-Type', /json/)
                    //.expect(200)
                    .end(function (err, res) {
                        // set new token for test only
                        dummyAccount = res.body.data;

                        done();
                    });
            });
        });
        // dump core documents
    });

    it("read a user's all document", function (done) {
        var result = {
            message: 'OK: retrieve all done',
            data: {total_rows: 0, offset: 0, rows: []},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/document/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it("read a user's all document with query", function (done) {
        var result = {
            message: 'OK: retrieve all done',
            data: {total_rows: 0, offset: 0, rows: []},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/document/' + dummyAccount.haroo_id + "?type=all&page=1&order=by_updated_at")
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it("read a public document with bad url", function (done) {
        var result = {
            message: 'Internal Server Error: retrieve public document failed',
            data: {
                date: '20150210',
                counter: '1',
                counted: false,
                accessHost: 'supertest',
                accessIP: '127.0.0.1'
            },
            isResult: true,
            statusCode: 500,
            meta: {
                error: 'Internal Server Error',
                message: 'An internal server error occurred'
            },
            isDeveloperError: true
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/public/document')
                .set('x-access-host', 'supertest')
                .send({date: '20150210', counter: '1', counted: false})
                .expect('Content-Type', /json/)
                .expect(500)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it("read a user's one document", function (done) {
        var result = {
            message: 'OK: retrieve done',
            data: [],
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/document/' + dummyAccount.haroo_id + '/' + '')
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
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