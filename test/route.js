var assert = require("assert");

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Route', function () {
    describe('Middleware', function () {
        it('i18next bind to default', function (done) {
            var result = {
                msg: require('../locales/dev/translation.json').app.lang.testMsg
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.equal(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('i18next bind to `en`', function (done) {
            var result = {
                msg: require('../locales/en/translation.json').app.lang.testMsg
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n-en')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('i18next should bind to `en` by request header', function (done) {
            var result = {
                msg: require('../locales/en/translation.json').app.lang.testMsg
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/i18n-en')
                    .set('Accept-Language','en-US')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
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

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('specified version 1 route', function (done) {
            var result = {
                msg: "version: 1.0.x"
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .set('Accept-Version','~1.0')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('specified version 1.2.3 route', function (done) {
            var result = {
                msg: "version: 1.2.3"
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .set('Accept-Version','1.2.3')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });

        it('specified version 2 route', function (done) {
            var result = {
                msg: "version: 2.x.x"
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .get('/version')
                    .set('Accept-Version','~2')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body.msg, result.msg);
                        done();
                    });
            });
        });
    });

    it('test route for testing', function (done) {
        var result = {msg: 'hi'};

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/testing')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it('test parameter route for testing', function (done) {
        var result = {msg: 'hi', params: {name: 'hello'}};

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/testing/hello')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it('test custom parameter with no X-Access-Host', function (done) {
        var result = {
            msg: 'custom param in route',
            data: {
                ip: '127.0.0.1'
            }};

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/test-no-header-locals')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it('test custom parameter with X-Access-Host', function (done) {
        var result = {
            msg: 'custom param in route',
            data: {
                ip: '127.0.0.1',
                host: 'test local machine'
            }
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/test-with-header-locals')
                .set('X-Access-Host', 'test local machine')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });


    it('just access denying', function (done) {
        var result = {
            message: 'Bad Request: access deny',
            data: null,
            isResult: true,
            statusCode: 400,
            meta: {error: 'Bad Request', message: 'access deny'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .get('/access-deny')
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                })
        })
    });

    it('districted access token deny with X-Access-Token', function (done) {
        var result = {
            message: 'Bad Request: access deny',
            data: null,
            isResult: true,
            statusCode: 400,
            meta: {error: 'Bad Request', message: 'access deny'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/access-no-header-token')
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                })
        })
    });
});
