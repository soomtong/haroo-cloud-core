var uuid = require('node-uuid');
var uuid_v5 = require('uuidv5');
var removeMarkdown = require('remove-markdown');

var util = require('./util');

var HOUR = 3600000;
var DAY = HOUR * 24;

exports.initHarooID = function (email) {
    var nameToken = "haroocloud";
    var prefix = "ko";

    var namespace = uuid_v5('null', nameToken, true);
    var uuid = uuid_v5(namespace, email);

    //return createNewHarooID(email, nameToken, prefix);
    return prefix + uuid.replace(/-/g,'');
};

/*
exports.initAccountDatabase = function (haroo_id, couch, callback) {
    if (!haroo_id) throw new Error('no haroo id assigned');

    //var InitUserDB = new InitAccount.initUserDB(couch.host, couch.port, couch.auth[0], couch.auth[1]);

    /!*
    InitUserDB.createNewAccount(haroo_id, function (err, res) {
        callback(err, res);
    });
    *!/

    callback({}, {});
};
*/

exports.getAccessToken = function () {
    return uuid.v4();
};

exports.getRandomToken = function () {
    return uuid.v1();
};

exports.getToday = function () {
    //return new Date().toISOString().slice(0, 10);
    return (new Date().toISOString().slice(0, 10)).replace(/-/g,'');
};

exports.makeZeroFill = function (num, numZeros) {
    // ref. http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
    if (!num) num = 1;
    if (!numZeros) numZeros = 3;
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
        zeroString = '-' + zeroString;
    }

    return zeroString + n;
};

exports.getLoginExpireDate = function () {
    return Date.now() + ( 15 * Number(DAY) );
};

exports.getPasswordResetExpire = function () {
    return Date.now() + Number(DAY);
};

exports.isThisTokenExpired = function (tokenData) {
    return tokenData.login_expire < Date.now();
};

exports.setDataToClient = function (userData, tokenData) {
    var result = {};

    result.email = userData.email;
    result.haroo_id = userData.haroo_id;
    result.profile = userData.profile;
    //result.db_host = userData.db_host || 'default_database.haroopress.com';

    if (tokenData) {
        if (tokenData.access_host) result.access_host = tokenData.access_host;
        if (tokenData.access_token) result.access_token = tokenData.access_token;
        if (tokenData.login_expire) result.login_expire = tokenData.login_expire;
    }

    if (userData.facebook) result.facebook = userData.facebook;
    if (userData.twitter) result.twitter = userData.twitter;
    if (userData.google) result.google = userData.google;
    if (userData.tokens) result.tokens = userData.tokens;

    return result;
};

exports.getHeaderTextFromMarkdown = function (markdown, limit) {
    var arr = markdown.split(/\r*\n/), len = arr.length;
    var text = [];

    limit = limit || 30;

    for (var i = 0; i < len; i++) {
        var temp = '';

        temp = removeMarkdown(arr[i]);

        if (temp) {
            text.push(temp);
        }

        // check count length
        if (text.join('\n').length > limit) break;
    }

    return text.join('\n').substr(0, limit).trim();

};
