var restify = require('restify');
var restifyValidation = require('node-restify-validation');
var i18n = require('i18next');

var config = require('./config');
var middleware = require('./middleware');

var feedback = require('./lib/feedback');

var dummyTest = require('./api/dummy');
var staticPage = require('./api/static');

var account = require('./api/account');

function route(mode, callback) {

    var app = config({mode: mode}).app;
    i18n.init({
        lng: app.lang,
        useCookie: false,
        debug: false,
        sendMissingTo: 'fallback'
    });

    var server = restify.createServer({
        name: 'haroo-cloud-core'
    });

    // globalMiddleware
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

    // dummy testing
    server.get('/api/testing/', dummyTest.testSimple);
    server.get('/api/testing/:name', dummyTest.testSimpleWithParam);
    server.get('/api/i18n', dummyTest.testI18N);
    server.get('/api/i18n-en', dummyTest.testEnForce);

    // version specified api for only feature test
    server.get({ path: '/api/version', version: '1.0.1'}, dummyTest.testVersion1);
    server.get({ path: '/api/version', version: '1.2.3'}, dummyTest.testVersion1_2_3);
    server.get({ path: '/api/version', version: '2.0.1'}, dummyTest.testVersion2);

    // haroo cloud api document page
    server.get('/', staticPage.home);

    // commonMiddleware
    // set host name to res.locals for all client
    server.use(middleware.accessClient);
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restifyValidation.validationPlugin({
        //errorHandler: middleware.validationError
        // shit, can't set custom res.status by standard features, need a hack. let's do it later.
        // todo: hack restifyValidation errorhandler
    }));
    /*
     patch this and update this middleware
     var handle = function (errors, req, res, options, next) {
        if (options.errorHandler) {
            return options.errorHandler(errors, res);   // for custom res.status
        } else {
            return res.send(400, {
                status: 'validation failed',
                errors: errors
            });
        }
     }
     */

    // header parameter test
    server.get('/api/test-no-header-locals', dummyTest.testCustomParams);
    server.get('/api/test-with-header-locals', dummyTest.testCustomParams);

    // for account
    server.post({ path: '/api/account/create', validation: {
        email: { isRequired: true, isEmail: true },
        password: { isRequired: true }
    }}, middleware.getCoreDatabase(mode), account.createAccount);
    server.post({ path: '/api/account/login', validation: {
        email: { isRequired: true, isEmail: true },
        password: { isRequired: true }
    }}, account.readAccount);
    server.post({ path: '/api/account/forgot_password', validation: {
        email: { isRequired: true, isEmail: true }
    }}, middleware.getCoreMailer(mode), account.mailingResetPassword);

    // districtMiddleware
    server.use(middleware.accessToken);

    // district test
    server.get('/api/access-deny', dummyTest.noAccessToken);
    server.post('/api/access-no-header-token', dummyTest.noAccessToken);

    // for token
    server.post('/api/token/validate', account.validateToken);

    // for api version
    server.post('/api/spec/version', function (req, res, next) {
        var version = require('../package').version;

        var msg = i18n.t('app.version.done');
        var result = feedback.done(msg, {ver: version, released: new Date('2015-3-1')});

        res.json(result);

        next();
    });

    // for users
    server.post({ path: '/api/user/:haroo_id/info', validation: {
        haroo_id: { isRequired: true }
    }}, account.getValidateToken, account.accountInfo);
    server.post({ path: '/api/user/:haroo_id/change_password', validation: {
        haroo_id: { isRequired: true },
        email: { isRequired: true, isEmail: true },
        password: { isRequired: true }
    }}, account.getValidateToken, account.updatePassword);
    server.post({ path: '/api/user/:haroo_id/update_info', validation: {
        haroo_id: { isRequired: true },
        email: { isRequired: true, isEmail: true }
    }}, account.getValidateToken, account.updateAccountInfo);
    server.post({ path: '/api/user/:haroo_id/logout', validation: {
        haroo_id: { isRequired: true },
        email: { isRequired: true, isEmail: true }
    }}, account.getValidateToken, account.dismissAccount);
    server.post({ path: '/api/user/:haroo_id/delete', validation: {
        haroo_id: { isRequired: true },
        email: { isRequired: true, isEmail: true },
        password: { isRequired: true }
    }}, account.getValidateToken, account.removeAccount);



    callback(server);
}

module.exports = route;