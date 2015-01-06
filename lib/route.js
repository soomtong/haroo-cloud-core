var restify = require('restify');
var i18n = require('i18next');

var config = require('./config');

var server = restify.createServer();

function commonMiddleware(mode) {
    server.use(i18n.handle);
    server.use(function log(req, res, next) {
        //console.log('current language :', i18n.lng());
        next();
    });
}

function districtMiddleware(mode) {

}

function route(mode, callback) {
    var app = config({mode: mode}).app;

    i18n.init({
        lang: app.lang,
        useCookie: false,
        debug: false,
        sendMissingTo: 'fallback'
    });

    commonMiddleware(mode);

    server.get('/testing', function (req, res) {
        res.json({msg: "hi"});
    });

    server.get('/i18n', function (req, res) {
        res.json({msg: req.i18n.t('app.lang.testMsg')});
    });

    server.get('/i18n-en', function (req, res) {
        i18n.setLng('en', function (t) {
            //res.json({msg: 'locale: ' + i18n.lng() + ', test message: ' + t('app.lang.testMsg')});
            res.json({msg: t('app.lang.testMsg')});
        });
    });

    districtMiddleware(mode);

    server.get('/access_deny', function (req, res) {
        res.json({msg: "hi"});
    });


    callback(server);
}

module.exports = route;