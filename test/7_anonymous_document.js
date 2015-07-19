var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Anonymous Document', function () {

    var dummyDocument;

    it("save one anonymous document", function (done) {
        var document = {
            text: "test content no title"
        };

        var expected_result = {
            message: 'OK: done',
            data: {
                text: 'test content no title',
                view_count: 0,
                commend_count: 0,
                alert_count: 0
            },
            isResult: true,
            statusCode: 200,
            meta: { error: 'OK', message: 'done' }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/tree/doc')
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.equal(res.body.data.text, expected_result.data.text);
                    assert.equal(res.body.data.view_count, expected_result.data.view_count);
                    assert.equal(res.body.data.commend_count, expected_result.data.commend_count);
                    assert.equal(res.body.data.alert_count, expected_result.data.alert_count);

                    res.body.data = undefined;
                    expected_result.data = undefined;

                    assert.deepEqual(res.body, expected_result);

                    done();
                });
        });
    });

    it("save one anonymous document with title", function (done) {
        var document = {
            title: "test title",
            text: "test content with title"
        };

        var expectedResult = {
            message: 'OK: done',
            data: {
                title: "test title",
                text: 'test content with title',
                view_count: 0,
                commend_count: 0,
                alert_count: 0
            },
            isResult: true,
            statusCode: 200,
            meta: { error: 'OK', message: 'done' }
        };


        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/tree/doc')
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.equal(res.body.data.title, expectedResult.data.title);
                    assert.equal(res.body.data.text, expectedResult.data.text);
                    assert.equal(res.body.data.view_count, expectedResult.data.view_count);
                    assert.equal(res.body.data.commend_count, expectedResult.data.commend_count);
                    assert.equal(res.body.data.alert_count, expectedResult.data.alert_count);

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save one anonymous document with title and author", function (done) {
        var document = {
            title: "test title",
            author: 'anonymous_101',
            text: "test content with title and author"
        };

        var expectedResult = {
            message: 'OK: done',
            data: {
                title: "test title",
                text: 'test content with title and author',
                author: 'anonymous_101',
                view_count: 0,
                commend_count: 0,
                alert_count: 0
            },
            isResult: true,
            statusCode: 200,
            meta: { error: 'OK', message: 'done' }
        };


        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/tree/doc')
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.equal(res.body.data.title, expectedResult.data.title);
                    assert.equal(res.body.data.text, expectedResult.data.text);
                    assert.equal(res.body.data.author, expectedResult.data.author);
                    assert.equal(res.body.data.view_count, expectedResult.data.view_count);
                    assert.equal(res.body.data.commend_count, expectedResult.data.commend_count);
                    assert.equal(res.body.data.alert_count, expectedResult.data.alert_count);

                    dummyDocument = res.body.data;

                    res.body.data = undefined;
                    expectedResult.data = undefined;

                    assert.deepEqual(res.body, expectedResult);

                    done();
                });
        });
    });

    it("save one anonymous document with not expected parameter", function (done) {
        var document = {
            text1: 'dummy text'
        };

        var expectedResult = {
            message: 'Not Acceptable: validation failed',
            isResult: true,
            statusCode: 406,
            meta: { error: 'Not Acceptable', message: 'validation failed' }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/tree/doc')
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

/*
    it("read a public document with specified hash", function (done) {
        var result = {
            message: 'OK: retrieve all done',
            data: {total_rows: 0, offset: 0, rows: []},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/api/tree/doc/' + dummyDocument.document_id)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });
*/


});