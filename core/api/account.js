var i18n = require('i18next');

var feedback = require('../lib/feedback');
var common = require('../lib/common');

var Account = require('../models/account');
var AccountToken = require('../models/accountToken');

// signup
exports.createAccount = function (req, res, next) {
    var params = {
        email: req.params['email'],
        password: req.params['password'],
        nickname: req.params['nickname'],
        joinFrom: req.params['client_id'],
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        database: res.coreDatabase['host']
    };

    var msg, client, result;

    Account.findOne({ email: params.email }, function(err, existUser) {
        if (err || existUser) {
            msg = i18n.t('account.create.exist');
            result = feedback.done(msg, params);

            res.json(result);
            return;
        }

        // make new account
        var haroo_id = common.initHarooID(params.email, res.coreDatabase);

        if (!haroo_id) {
            //throw new Error('no exist haroo id!');
            msg = i18n.t('account.create.fail');
            result = feedback.done(msg, params);

            res.json(result);
            return;
        }

        var user = new Account({
            email: params.email,
            password: params.password,
            haroo_id: haroo_id,
            join_from: params.joinFrom,
            db_host: params.database,
            created_at: Date.now(),
            profile: {
                nickname: params.nickname
            }
        });

        // init couch collection for account
        common.initAccountDatabase(haroo_id, res.coreDatabase);

        // save account to mongo
        user.save(function (err) {
            if (err) {
                msg = i18n.t('account.create.fail');
                result = feedback.done(msg, err);

                res.json(result);
                return;
            }

            // make new account token
            var token = new AccountToken({
                access_ip: params.accessIP,
                access_host: params.accessHost,
                access_token: common.getAccessToken(),
                haroo_id: haroo_id,
                login_expire: common.getLoginExpireDate(),
                created_at: Date.now()
            });

            token.save(function (err) {
                if (err) {
                    msg = i18n.t('token.create.fail');
                    result = feedback.done(msg, err);

                    res.json(result);
                    return;
                }
                //AccountLog.signUp({email: params['email']});

                // done right
                msg = i18n.t('account.create.done');
                client = common.setDataToClient(user, token);

                result = feedback.done(msg, client);

                res.json(result);
            });
        });
    });
    next();
};
