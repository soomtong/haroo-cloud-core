var apiCallCounterForIPs = [];
var apiCallCounterForToken = [];

// ref. Express, https://github.com/strongloop/express/blob/master/lib/request.js#L380
function getHostIp(host) {
    // IPv6 literal support
    var offset = host[0] === '['
        ? host.indexOf(']') + 1
        : 0;
    var index = host.indexOf(':', offset);

    return ~index
        ? host.substring(0, index)
        : host;
}

exports.callCounterForIPs = function (req, res, next) {
    var ip = getHostIp(req.header('host'));

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
    return next();
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
    return next();
};


// tracking host name
exports.accessHost = function (req, res, next) {
    var host = res.accessHost = req.header('x-access-host');
    var ip = res.accessIP = getHostIp(req.header('host'));

    return next();
};

// block unknown
exports.accessToken = function (req, res, next) {
    var token = res.accessToken = req.header('x-access-token');

    if (!token) throw "no token, that's blocked";

    return next();
};

// select database info
exports.getCoreDatabase = function (mode) {
    var config = require('./config');
    var couchServer = config({mode: mode}).database;

    return function (req, res, next) {
        var database = couchServer.server[0];

        res.coreDatabase = database.host;

        return next();
    };
};