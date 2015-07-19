var restify = require('restify');
var restifyValidation = require('node-restify-validation');
var i18n = require('i18next');
var corsMiddleware = require('restify-cors-middleware');

var config = require('./config');
var middleware = require('./middleware');

var feedback = require('./lib/feedback');

var dummyTest = require('./api/dummy');
var anonymous = require('./api/anonymous');
var account = require('./api/account');
var document = require('./api/document');

function route(mode, callback) {

    var app = config({mode: mode}).app;

    // init for localize
    i18n.init({
        lng: app.lang,
        useCookie: false,
        debug: false,
        sendMissingTo: 'fallback'
    });

    // init restify server
    var options = {
        name: app.name
    };

    var server = restify.createServer(options);

    // globalMiddleware
    // throttle
    server.use(restify.throttle({
        burst: 100,
        rate: 5,
        ip: true,
        overrides: {
            '192.168.1.1': {
                rate: 0,        // unlimited
                burst: 0
            }
        }
    }));

    // allow cors
    var cors = corsMiddleware({
        allowHeaders: ['X-Access-Host', 'X-Access-Token', 'X-Developer-Token']
    });

    server.pre(cors.preflight);
    server.use(cors.actual);

    // api counter for ip district
    server.use(middleware.callCounterForIPs);
    server.use(middleware.callCounterForToken);


    // static pages
    // redirect not ended '/' trail
    server.get(/^\/(dev\/doc)$/, function (req, res, next) {
        res.redirect('/dev/doc/', next);
    });

    // haroo cloud api document page
    server.get(/^\/(?!api).*$/, restify.serveStatic({
        directory: 'static',
        default: 'index.html'
    }));


    // dummy testing
    server.get('/api', dummyTest.testVersion1);
    server.get('/api/testing', dummyTest.testSimple);
    server.get('/api/testing/:name', dummyTest.testSimpleWithParam);
    server.get('/api/i18n', dummyTest.testI18N);
    server.get('/api/i18n-en', dummyTest.testEnForce);

    // version specified api for only feature test
    server.get({ path: '/api/version', version: '1.0.1'}, dummyTest.testVersion1);
    server.get({ path: '/api/version', version: '1.2.3'}, dummyTest.testVersion1_2_3);
    server.get({ path: '/api/version', version: '2.0.1'}, dummyTest.testVersion2);


    // commonMiddleware
    // set host name to res.locals for all client
    server.use(middleware.accessClient);
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restifyValidation.validationPlugin({
        errorsAsArray: false,
        handleError: middleware.validationError
        // no errorHandler, use handleError
    }));

    // header parameter test
    server.get('/api/test-no-header-locals', dummyTest.testCustomParams);
    server.get('/api/test-with-header-locals', dummyTest.testCustomParams);


    // anonymous document hosting service
    // for anonymous documents
    server.post({ path: '/api/tree/doc', validation: {
        content: {
            text: { isRequired: true }
        }
    }}, anonymous.createDocument);
    server.get({ path: '/api/tree/doc/:doc_id', validation: {
        resources: {
            doc_id: { isRequired: true }
        }
    }}, anonymous.readDocument);
    server.get({ path: '/api/tree/stat/:doc_id', validation: {
        resources: {
            doc_id: { isRequired: true }
        }
    }}, anonymous.statDocument);
    server.get({ path: '/api/tree/list', validation: {
        queries: {
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] }
        }
    }}, anonymous.listDocument);
    server.get({ path: '/api/tree/doc/:doc_id/:feedback', validation: {
        resources: {
            doc_id: { isRequired: true },
            feedback: { isRequired: true, isIn: ['commend', 'claim'] }
        }
    }}, anonymous.feedbackDocument);


    // for account
    server.post({ path: '/api/account/create', validation: {
        content: {
            email: { isRequired: true, isEmail: true },
            password: { isRequired: true }
        }
    }}, /*middleware.getCoreDatabase(mode),*/ account.createAccount);
    server.post({ path: '/api/account/login', validation: {
        content: {
            email: { isRequired: true, isEmail: true },
            password: { isRequired: true }
        }
    }}, account.readAccount);
    server.post({ path: '/api/account/forgot_password', validation: {
        content: {
            email: { isRequired: true, isEmail: true }
        }
    }}, middleware.getCoreMailer(mode), account.mailingResetPassword);
    server.post({ path: '/api/account/reset_password', validation: {
        content: {
            token: { isRequired: true },
            password: { isRequired: true }
        }
    }}, account.updatePasswordForReset);

    // for public documents
    server.post({ path: '/api/public/document', validation: {
        content: {
            date: { isRequired: true },
            counter: { isRequired: true },
            counted: { isRequired: true }
        }
    }}, document.readPublicDocument);


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
    server.get({ path: '/api/user/:haroo_id/info', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, account.accountInfo);
    server.post({ path: '/api/user/:haroo_id/change_password', validation: {
        resources: {
            haroo_id: { isRequired: true }
        },
        content: {
            email: { isRequired: true, isEmail: true },
            password: { isRequired: true }
        }
    }}, account.getValidateToken, account.updatePassword);
    server.post({ path: '/api/user/:haroo_id/update_info', validation: {
        resources: {
            haroo_id: { isRequired: true }
        },
        content: {
            email: { isRequired: true, isEmail: true }
        }
    }}, account.getValidateToken, account.updateAccountInfo);
    server.post({ path: '/api/user/:haroo_id/logout', validation: {
        resources: {
            haroo_id: { isRequired: true }
        },
        content: {
            email: { isRequired: true, isEmail: true }
        }
    }}, account.getValidateToken, account.dismissAccount);
    server.post({ path: '/api/user/:haroo_id/delete', validation: {
        resources: {
            haroo_id: { isRequired: true }
        },
        content: {
            email: { isRequired: true, isEmail: true },
            password: { isRequired: true }
        }
    }}, account.getValidateToken, account.removeAccount);

    // for documents, sync process are using a proxy just.
    server.post({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.put);
    server.get({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.get);
    server.post({ path: '/api/document/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.save);
    server.get({ path: '/api/document/:haroo_id/:document_id', validation: {
        resources: {
            haroo_id: { isRequired: true },
            document_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.read);
    server.get({ path: '/api/document/:haroo_id/:document_id/public', validation: {
        resources: {
            haroo_id: { isRequired: true },
            document_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.togglePublic);


    callback(server);
}

module.exports = route;