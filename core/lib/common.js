var InitAccount = require('init-user');
var uuid = require('node-uuid');

var util = require('./util');

var HOUR = 3600000;
var DAY = HOUR * 24;

exports.initHarooID = function (email, database) {
    var nameToken = database.host || "database1";
    var prefix = database.prefix;

    return InitAccount.initHarooID(email, nameToken, prefix);
};

exports.initAccountDatabase = function (haroo_id, couch, callback) {
    if (!haroo_id) throw new Error('no haroo id assigned');

    var InitUserDB = new InitAccount.initUserDB(couch.host, couch.port, couch.auth[0], couch.auth[1]);

    InitUserDB.createNewAccount(haroo_id, function (err, res) {
        callback(err, res);
    });
};

exports.getAccessToken = function () {
    return uuid.v4();
};

exports.getRandomToken = function () {
    return uuid.v1();
};

exports.getLoginExpireDate = function () {
    return Date.now() + ( 15 * Number(DAY) );
};

exports.getPasswordResetExpire = function () {
    return Date.now() + Number(DAY);
};

exports.setDataToClient = function (userData, tokenData) {
    var result = {};

    result.email = userData.email;
    result.haroo_id = userData.haroo_id;
    result.profile = userData.profile;
    result.db_host = userData.db_host || 'default_database.haroopress.com';

    if (tokenData) {
        if (tokenData.access_host) result.access_host = tokenData.access_host;
        if (tokenData.access_token) result.access_token = tokenData.access_token;
        if (tokenData.login_expire) result.login_expire = tokenData.login_expire;
    }

    if (userData.provider) result.provider = userData.provider;
    if (userData.tokens) result.tokens = userData.tokens;

    return result;
};