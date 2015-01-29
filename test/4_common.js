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

    it('should exist base collection for replication', function (done) {
        var nano = require('nano');
        var database = app.config({mode: 'testing'})['database']['couch'][0];
        var url = 'http://'+ database.auth[0] +':'+ database.auth[1] +'@'+ database.host +':'+ database.port;

        var couch = nano(url);
        var baseCollectionName = "haroonote$_account_new";

        couch.db.get(baseCollectionName, function (err) {
            assert.ok(!err);

            done();
        });
    });

    it('copy new couch collection to new account', function (done) {
        var database = app.config({mode: 'testing'})['database']['couch'][0];
        var email = "test@email.net";
        var validHarooID = common.initHarooID(email, database);

        common.initAccountDatabase(validHarooID, database, function (err, res) {
            assert.ok(res.ok);
            done();
        });
    });
});

describe('ThirdParty Module', function () {

    it('send mail using nodemailer', function (done) {
        this.timeout(5000);

        var mailer = app.config({mode: 'development'})['mailer'];
        var email = "soomtong@gmail.com";
        var param = {link: 'http://localhost/account/update-password/no_exist'};

        // just for convenience
        if (false) {
            sendmail.sendPasswordResetMailByDelegate(email, param, mailer.delegate,
                function (result) {
                    assert.equal(result.response.slice(0, 3), '250');
                    done();
                });
        } else {
            done();
        }
    });
});