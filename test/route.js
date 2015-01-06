var supertest = require('supertest');
var app = require('../app');

var assert = require("assert");

describe('Route', function () {
    describe('Middleware', function () {
        it('i18next bind to default', function (done) {
            var result = {
                msg: require('../locales/dev/translation.json').app.lang.testMsg
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.equal(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('i18next bind to `en`', function (done) {
            var result = {
                msg: require('../locales/en/translation.json').app.lang.testMsg
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n-en')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('i18next should bind to `en` by request header', function (done) {
            var result = {
                msg: require('../locales/en/translation.json').app.lang.testMsg
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n-en')
                    .set('Accept-Language','en-US')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

    });

    describe('Version specified', function () {
        it('default version route', function (done) {
            var result = {
                msg: "version: 2.x.x"
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('specified version 1 route', function (done) {
            var result = {
                msg: "version: 1.x.x"
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .set('Accept-Version','~1')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('specified version 2 route', function (done) {
            var result = {
                msg: "version: 2.x.x"
            };

            app.route(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .set('Accept-Version','~2')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });
    });

    it('test route for testing', function (done) {
        var result = {msg: 'hi'};

        app.route(app.node_env, function (server) {
            supertest(server)
                .get('/testing')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it('just access denying', function (done) {
        var result = {};

        app.route(app.node_env, function (server) {
            supertest(server)
                .get('/access_deny')
                .end(function (err, res) {
                    assert.ok(true);
                    done();
                })
        })
    })
});
