var InitAccount = require('init-user');

exports.initHarooID = function (email, database) {
    var nameToken = database.host || "database1";

    return InitAccount.initHarooID(email, nameToken);
};

exports.initAccountDatabase = function (haroo_id, database) {
    var InitUserDB = new InitAccount.initUserDB(database.couch.host, database.couch.port, database.couch.id, database.couch.pass);

    InitUserDB.createNewAccount(haroo_id, function (err, res) {
        if (err) {
            throw new Error('fail make new account with couch database');
        }
    });
};

