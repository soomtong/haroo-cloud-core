var i18n = require('i18next');
var feedback = require('./lib/feedback');

var config = require('./config');
var util = require('./lib/util');

// todo: upgrade to session, just for test now
var apiCallCounterForIPs = [];
var apiCallCounterForToken = [];

exports.callCounterForIPs = function (req, res, next) {
    var ip = util.getHostIp(req.header('host'));

    if (ip) {
        var now = Date.now();
        if (apiCallCounterForIPs[ip] && apiCallCounterForIPs[ip].count) {
            apiCallCounterForIPs[ip].count++;
            apiCallCounterForIPs[ip].updateAt = now;
        } else {
            apiCallCounterForIPs[ip] = {
                count: 1,
                updateAt: now
            }
        }
        //console.log('count call for ip', apiCallCounterForIPs);
    }
    next();
};

exports.callCounterForToken = function (req, res, next) {
    var token = req.header('x-access-token');

    if (token) {
        var now = Date.now();
        if (apiCallCounterForToken[token] && apiCallCounterForToken[token].count) {
            apiCallCounterForToken[token].count++;
            apiCallCounterForToken[token].updateAt = now;
        } else {
            apiCallCounterForToken[token] = {
                count: 1,
                updateAt: now
            }
        }
        //console.log('count call for token', apiCallCounterForToken);
    }
    next();
};

// tracking host name
exports.accessClient = function (req, res, next) {
    var host = res.accessHost = req.header('x-access-host');
    var ip = res.accessIP = util.getHostIp(req.header('host'));

    next();
};

// block unknown
exports.accessToken = function (req, res, next) {
    var token = res.accessToken = req.header('x-access-token');

    //if (!token) throw "no token, that's blocked";
    if (!token) {
        var msg = i18n.t('token.read.notExist');
        var result = feedback.badRequest(msg);

        return res.json(result.statusCode, result);
    }

    next();
};

// select database info
exports.getCoreDatabase = function (mode) {
    var server = config({mode: mode})['database'];

    return function (req, res, next) {
        res.coreDatabase = server.couch[0];

        next();
    };
};

// select mail server info
exports.getCoreMailer = function (mode) {
    var mailer = config({mode: mode})['mailer'];
    var server = config({mode: mode})['web_server'];

    return function (req, res, next) {
        res.coreMailer = mailer;
        res.coreHost = (server.secure ? 'https://' : 'http://') + server.host + (server.port ? ':' + server.port : '');

        next();
    };
};

// request validation error handler
exports.validationError = function (errors) {
    return feedback.badData("validation failed", errors);
};