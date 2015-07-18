var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Public Document', function () {

    var dummyDocument;

    // no needed account

    it("save one public document", function (done) {
        var document = {
            title: "test title",
            content: "test content"
        };

        var result = {
            message: 'OK: retrieve all done',
            data: {
                title: document.title,
                view: 0,
                commend: 0
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'retrieve all done'}
        };


        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/api/tree/doc/')
                .send(document)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    // assign data to dummy document
                    dummyDocument = res.body.data;

                    done();
                });
        });
    });


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
                .post('/api/tree/doc/')
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