var assert = require("assert");

var common = require('../core/lib/common');
var sendmail = require('../core/lib/sendmail');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Common Module', function () {
    it('haroo id generation', function () {
        var database = app.config({mode: 'testing'})['database']['couch'][0];
        var email = 'soomtong@gmail.com';
        var validHarooID = common.initHarooID(email, database);

        assert.deepEqual(validHarooID, common.initHarooID(email, database));
    });

    it('copy new couch collection to new account', function () {
        var database = app.config({mode: 'testing'})['database']['couch'][0];
        var email = "test@email.net";
        var validHarooID = common.initHarooID(email, database);

        common.initAccountDatabase(validHarooID, database);
    });
});

describe('ThirdParty Module', function () {
    it('send mail using nodemailer', function (done) {
        console.log(app.config({mode: 'development'}));
        var mailer = app.config({mode: 'development'})['mailer'];
        var email = "soomtong@gmail.com";

        sendmail.sendPasswordResetMailByDelegate(email, {link: 'http://localhost/account/update-password/no_exist'}, mailer.delegate,
        function (result) {
            console.log(result);
            done();
        });
    });
});