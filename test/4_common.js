var assert = require("assert");

var common = require('../core/lib/common');
var sendmail = require('../core/lib/sendmail');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Common Module', function () {

    it('haroo id generation', function () {
        var email = 'soomtong@gmail.com';
        var validHarooID = common.initHarooID(email);

        assert.deepEqual(validHarooID, common.initHarooID(email));
    });
/*
    it('should exist base collection for replication', function (done) {
        var url = 'http://'+ database.auth[0] +':'+ database.auth[1] +'@'+ database.host +':'+ database.port;

        var couch = nano(url);
        var baseCollectionName = "haroonote$_account_new";

        couch.db.get(baseCollectionName, function (err) {
            assert.ok(!err);

            done();
        });
    });

    it('copy new couch collection to new account', function (done) {
        var email = "test@email.net";
        var validHarooID = common.initHarooID(email);

        common.initAccountDatabase(validHarooID, function (err, res) {
            assert.ok(res.ok);
            done();
        });
    });
*/

    it('stripe markdown token and contract text', function () {
        var markdown = '# This is a heading\n\n\r\nThis is a paragraph with [a link](http://www.disney.com/) in it.';
        var text = common.getHeaderTextFromMarkdown(markdown, 10);

        assert.equal(text, 'This is a');
    });

    it('stripe markdown token and contract text with trim', function () {
        var markdown = '# This is a heading\n\n\r\nThis is a paragraph with [a link](http://www.disney.com/) in it.';
        var text = common.getHeaderTextFromMarkdown(markdown, 9);

        assert.equal(text, 'This is a');
    });

    it('stripe markdown token and contract text long', function () {
        var markdown = '# This is a heading\n\n\r\nThis is a paragraph with [a link](http://www.disney.com/) in it.';
        var text = common.getHeaderTextFromMarkdown(markdown, 30);

        assert.equal(text, 'This is a heading\nThis is a pa');
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
