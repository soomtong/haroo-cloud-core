var restify = require('restify');
var i18n = require('i18next');

var config = require('./config');
var middleware = require('./middleware');

var dummyTest = require('./api/dummy');
var staticPage = require('./api/static');

var server = restify.createServer();

function commonMiddleware(mode) {
    // api counter for ip district
    server.use(middleware.callCounterForIPs);

    // set host name to res.locals for all client
    server.use(middleware.accessHost);
}

function districtMiddleware(mode) {
// todo: access deny middleware
}

function route(mode, callback) {
    var app = config({mode: mode}).app;

    i18n.init({
        lng: app.lang,
        useCookie: false,
        debug: false,
        sendMissingTo: 'fallback'
    });

    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true,
        overrides: {
            '192.168.1.1': {
                rate: 0,        // unlimited
                burst: 0
            }
        }
    }));

    server.use(restify.requestLogger());

    server.get('/testing/', dummyTest.testSimple);
    server.get('/testing/:name', dummyTest.testSimpleWithParam);
    server.get('/i18n', dummyTest.testI18N);
    server.get('/i18n-en', dummyTest.testEnForce);
    server.get({ path: '/version', version: '1.0.1'}, dummyTest.testVersion1);
    server.get({ path: '/version', version: '1.2.3'}, dummyTest.testVersion1_2_3);
    server.get({ path: '/version', version: '2.0.1'}, dummyTest.testVersion2);

    server.get('/', staticPage.home);

    commonMiddleware(mode);

    server.get('/test-no-header-locals', dummyTest.testCustomParams);
    server.get('/test-with-header-locals', dummyTest.testCustomParams);

    server.get('/login', function (req, res) {
        // some static html page for api.haroocloud.com
        // just for only introduce
        res.send('login');
    });

    districtMiddleware(mode);

    server.get('/access_deny', function (req, res) {
        res.json({msg: "hi"});
    });


    callback(server);
}

module.exports = route;