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
                text: "normal text here"
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
                    assert.ok(!err, err);

                    assert.equal(res.body.data.text, expectedResult.data.text);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save a user's one document with title", function (done) {
        var document = {
            title: "titled document",
            text: "another normal text here"
        };

        var expectedResult = {
            message: 'OK: done',
            data: {
                title: "titled document",
                text: "another normal text here"
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
                    assert.ok(!err, err);

                    assert.equal(res.body.data.title, expectedResult.data.title);
                    assert.equal(res.body.data.text, expectedResult.data.text);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save a user's one document no text", function (done) {
        var document = {
        };

        var expectedResult = {
            message: 'Not Acceptable: validation failed',
            data: {
                token_name: 'supertest',
                haroo_id: dummyAccount.haroo_id
            },
            isResult: true,
            statusCode: 406,
            meta: { error: 'Not Acceptable', message: 'validation failed' }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/document/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .send(document)
                .expect('Content-Type', /json/)
                .expect(406)
                .end(function (err, res) {
                    assert.ok(!err, err);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save a user's one document no haroo id", function (done) {
        var document = {
            text: 'no haroo id document'
        };

        var expectedResult = {
            message: 'Bad Request: access deny',
            data: {
                token_name: 'supertest',
                haroo_id: 'wrong haroo id'
            },
            isResult: true,
            statusCode: 400,
            meta: { error: 'Bad Request', message: 'access deny' }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/document/' + 'wrong haroo id')
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .send(document)
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);

                    assert.equal(res.body.data.accessHost, expectedResult.data.token_name);
                    assert.equal(res.body.data.haroo_id, expectedResult.data.haroo_id);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save a user's one document wrong access token", function (done) {
        var document = {
            title: 'wrong access token document',
            text: 'wrong access token document'
        };

        var expectedResult = {
            message: 'Bad Request: access deny',
            data: {
                token_name: 'supertest',
                haroo_id: dummyAccount.haroo_id
            },
            isResult: true,
            statusCode: 400,
            meta: { error: 'Bad Request', message: 'access deny' }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/document/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', 'wrong-access-token')
                .send(document)
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    console.log(res.body);

                    assert.ok(!err, err);

                    assert.equal(res.body.data.accessHost, expectedResult.data.token_name);
                    assert.equal(res.body.data.haroo_id, expectedResult.data.haroo_id);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

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