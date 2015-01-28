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

        Account.remove({}, function (err, result) {
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
            message: 'Precondition Failed: already exist',
            data: {
                email: 'test@email.net',
                password: 'new_password',
                accessHost: 'supertest',
                accessIP: '127.0.0.1',
                database: 'localhost'
            },
            isResult: true,
            statusCode: 412,
            meta: {error: 'Precondition Failed', message: 'already exist'}
        };

        app.init(app.node_env, function (server) {
            console.log(dummyAccount);
            supertest(server)
                .get('/api/documents/' + dummyAccount.haroo_id)
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    //console.log(res.body);
                    assert.ok(!err, err);

                    done();
                });
        });
    });
});