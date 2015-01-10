var assert = require("assert");

var common = require('../core/lib/common');

describe('Common Module', function () {
    it('haroo id generation', function () {
        var database = require('../config')['database']['testing']['couch'][0];
        var email = 'soomtong@gmail.com';
        var validHarooID = common.initHarooID(email, database);

        assert.deepEqual(validHarooID, common.initHarooID(email, database));
    });

    it('copy new couch collection to new account', function () {
        var database = require('../config')['database']['development']['couch'][0];
        var email = "test@email.net";
        var validHarooID = common.initHarooID(email, database);

        common.initAccountDatabase(validHarooID, database);
    });
});
