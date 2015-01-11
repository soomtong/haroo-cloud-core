var assert = require("assert");

var common = require('../core/lib/common');
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
