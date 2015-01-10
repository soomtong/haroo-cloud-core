var assert = require("assert");

var supertest = require('supertest');
var app = require('../app');

describe('Account', function () {

    it('create account by email, password and optional nickname', function (done) {
        var result = {msg: 'hi', params: {name: 'hello'}};

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({email: 'test@email.net', password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    //assert.deepEqual(res.body, result);
                    done();
                });
        });
    });
});