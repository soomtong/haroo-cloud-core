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
        },
        queries: {
            t: { isRequired: false }
        }
    }}, anonymous.readDocument);
    server.post({ path: '/api/tree/list', validation: {
        content: {
            list: { isRequired: true },
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] }
        }
    }}, anonymous.selectedListDocument);
    server.get({ path: '/api/tree/list', validation: {
        queries: {
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] },
            p: { isRequired: false, isInt: true },
            s: { isRequired: false, isInt: true }
        }
    }}, anonymous.listDocument);
    server.get({ path: '/api/tree/curate', validation: {
        queries: {
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] },
            p: { isRequired: false, isInt: true },
            s: { isRequired: false, isInt: true }
        }
    }}, anonymous.curateDocument);
    server.get({ path: '/api/tree/today', validation: {
        queries: {
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] },
            p: { isRequired: false, isInt: true },
            s: { isRequired: false, isInt: true }
        }
    }}, anonymous.todayDocument);
    server.get({ path: '/api/tree/stat/:doc_id', validation: {
        resources: {
            doc_id: { isRequired: true }
        }
    }}, anonymous.statDocument);
    server.post({ path: '/api/tree/feedback/:doc_id', validation: {
        resources: {
            doc_id: { isRequired: true }
        },
        content: {
            type: { isRequired: true, isIn: ['commend', 'claim'] },
            acc: { isRequired: true, isIn: ['+1', '-1'] }
            //acc: { isRequired: true, isBoolean: true }
        }
    }}, anonymous.feedbackDocument);
    server.post({ path: '/api/tree/search', validation: {
        content: {
            query: { isRequired: true },
            order: { isRequired: false, isIn: ['newest', 'oldest', 'hottest', 'coldest', 'commended', 'claimed'] },
            p: { isRequired: false, isInt: true },
            s: { isRequired: false, isInt: true }
        }
    }}, anonymous.searchDocument);


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

    // for documents
    server.post({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.createMulti);
    server.get({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.readMulti);
    server.put({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.updateMulti);
    server.del({ path: '/api/documents/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.deleteMulti);

    // for one document
    server.post({ path: '/api/document/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        },
        content: {
            text: { isRequired: true }
        }
    }}, account.getValidateToken, document.createOne);
    server.get({ path: '/api/document/:haroo_id/:document_id', validation: {
        resources: {
            haroo_id: { isRequired: true },
            document_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.readOne);
    server.put({ path: '/api/document/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.updateOne);
    server.del({ path: '/api/document/:haroo_id', validation: {
        resources: {
            haroo_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.deleteOne);

    // dupe public
    server.get({ path: '/api/document/:haroo_id/:document_id/public', validation: {
        resources: {
            haroo_id: { isRequired: true },
            document_id: { isRequired: true }
        }
    }}, account.getValidateToken, document.togglePublic);


    callback(server);
}

module.exports = route;