var restify = require('restify');
var i18n = require('i18next');

var config = require('./config');
var dummy = require('./api/dummy');

var server = restify.createServer();

function commonMiddleware(mode) {
    // no need to bind to router
    // server.use(i18n.handle);
    server.use(function log(req, res, next) {
        //console.log('current language :', i18n.lng(),'\n');
        next();
    });
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

    commonMiddleware(mode);

    server.get('/testing', dummy.testSimple);
    server.get('/i18n', dummy.testI18N);
    server.get('/i18n-en', dummy.testEnForce);
    server.get({ path: '/version', version: '1.3.1'}, dummy.testVersion1);
    server.get({ path: '/version', version: '2.1.9'}, dummy.testVersion2);


    server.get('/', function (req, res) {
        // some static html page for api.haroocloud.com
        // just for only introduce
        res.send('<h1>Index of Api service</h1>');
    });


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