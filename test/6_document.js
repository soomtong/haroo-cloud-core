var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Document', function () {

    var dummyAccount;       // for internal use only
    var dummyCollection;

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

    it("save a user's one document", function (done) {
        var document = {
            text: "normal text here"
        };

        var expectedResult = {
            message: 'OK: done',
            data: {
                url: ''
            },
            isResult: true,
            statusCode: 200,
            meta: { error: 'OK', message: 'done' }
        };


        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/document/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body);
                    assert.ok(!err, err);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save a user's one document with title", function (done) {
        var document = {
            title: "new title",
            name: "robert",
            age: 43
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/document/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
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

    it("read a user's documents multiple", function (done) {
        var result = {
            message: 'OK: retrieve all done',
            data: {total_rows: 0, offset: 0, rows: []},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/documents/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    dummyCollection = res.body.data;
                    done();
                });
        });
    });

    it("read a user's documents multiple with query", function (done) {
        var result = {
            message: 'OK: retrieve all done',
            data: {total_rows: 0, offset: 0, rows: []},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/documents/' + dummyAccount.haroo_id + '?page=2')
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    dummyCollection = res.body.data;
                    done();
                });
        });
    });

    it("save multiple documents for user's", function (done) {
        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/documents/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .send(dummyCollection)
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

});