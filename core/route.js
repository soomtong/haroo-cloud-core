var restify = require('restify');
var restifyValidation = require('node-restify-validation');
var i18n = require('i18next');

var config = require('./config');
var middleware = require('./middleware');

var dummyTest = require('./api/dummy');
var staticPage = require('./api/static');

var account = require('./api/account');

var server = restify.createServer({
    name: 'haroo-cloud-core'
});

function globalMiddleware(mode) {
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

    // api counter for ip district
    server.use(middleware.callCounterForIPs);
    server.use(middleware.callCounterForToken);
}

function commonMiddleware(mode) {
// set host name to res.locals for all client
    server.use(middleware.accessHost);
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restifyValidation.validationPlugin({}));
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

    globalMiddleware(mode);

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

    // 벨리데이션을 어디에서 하는게 좋을까.
    server.get({ path: '/validation/:name', validation: {
        // A 라우팅 다음 미들웨어
        name: { isRequired: true, isIn: ['foo','bar'] },
        status: { isRequired: true, isIn: ['foo','bar'] },
        email: { isRequired: false, isEmail: true },
        age: { isRequired: true, isInt: true }
    }}, function (req, res, next) {
        // B 애플리케이션 코드가 있는 메소드
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password must be at least 4 characters long').len(4);

        //var errors = req.validationErrors();

        res.send(req.params);
    });

    // for account
    server.post({ path: '/account/create', validation: {
        email: { isRequired: true, isEmail: true },
        password: { isRequired: true }
    }}, middleware.getCoreDatabase(mode), account.createAccount);

    server.get({ path: '/login', validation: {}}, function (req, res, next) {
        // some static html page for api.haroocloud.com
        // just for only introduce
        res.send('login');

        next();
    });

    districtMiddleware(mode);

    server.get('/access_deny', function (req, res, next) {
        res.json({msg: "hi"});

        next();
    });


    callback(server);
}

module.exports = route;