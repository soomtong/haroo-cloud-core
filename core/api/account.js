var i18n = require('i18next');

var feedback = require('../feedback');
var common = require('../lib/common');

var Account = require('../models/account');

// signup
exports.createAccount = function (req, res, next) {
    var params = {
        email: req.params.email,
        password: req.params.password,
        nickname: req.params.nickname,
        joinFrom: req.params.client_id,
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        database: res.coreDatabase
    };

    var msg, result;

    Account.findOne({ email: params.email }, function(err, existUser) {
        if (err || existUser) {
            msg = i18n.t('account.create.fail');
            result = feedback.done(msg, params);

            res.json(result);
            return;
        }

        // make new account
        var user = new Account({
            email: params.email,
            password: params.password,
            haroo_id: common.initHarooID(params.email, params.database),
            join_from: params.joinFrom,
            db_host: params.database.host,
            created_at: Date.now(),
            profile: {
                nickname: params.nickname
            }
        });

        // init couch collection for account
        common.initAccountDatabase(user.haroo_id, params.database);

        // save account to mongo
        user.save(function (err) {
            if (err) {
                params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.create.database, params['result'])
                callback(params['result']);
                return;
            }
            if (params['fromWeb']) {
                AccountLog.signUp({email: params['email']});
                params['result'] = CommonUtil.setAccountToClient(HarooCode.account.create.done, user);
                callback(params['result'], user);
            } else {
                // make new account token
                var token = new AccountToken({
                    access_ip: params['accessIP'],
                    access_host: params['accessHost'],
                    access_token: CommonUtil.getAccessToken(),
                    haroo_id: user.haroo_id,
                    login_expire: CommonUtil.getLoginExpireDate(),
                    created_at: Date.now()
                });
                token.save(function (err) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                        callback(params['result']);
                        return;
                    }
                    AccountLog.signUp({email: params['email']});
                    // done right
                    params['result'] = CommonUtil.setAccountToClient(HarooCode.account.create.done, user, token);
                    callback(params['result']);
                });
            }
        });
    });
    next();
};
