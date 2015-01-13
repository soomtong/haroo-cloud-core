var i18n = require('i18next');

var feedback = require('../lib/feedback');
var common = require('../lib/common');
var sendmail = require('../lib/sendmail');

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

            return res.json(result);
        }

        // make new account
        var haroo_id = common.initHarooID(params.email, res.coreDatabase);

        if (!haroo_id) {
            //throw new Error('no exist haroo id!');
            msg = i18n.t('account.create.fail');
            result = feedback.done(msg, params);

            return res.json(result);
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
        common.initAccountDatabase(haroo_id, res.coreDatabase, function (err, response) {
            if (err) {
                //throw new Error('fail make new account with couch database');
                msg = i18n.t('account.create.fail');
                result = feedback.done(msg, err);

                return res.json(result);
            }

            // save account to mongo
            user.save(function (err) {
                if (err) {
                    msg = i18n.t('account.create.fail');
                    result = feedback.done(msg, err);

                    return res.json(result);
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

                        return res.json(result);
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
    });
    next();
};

// login
exports.readAccount = function (req, res, next) {
    var params = {
        email: req.params['email'],
        password: req.params['password'],
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({email: params.email}, function (err, user) {
        if (!user) {
            msg = i18n.t('account.read.fail');
            result = feedback.done(msg, params);

            return res.json(result);
        }
        user.comparePassword(params.password, function (err, isMatch) {
            if (isMatch) {
                msg = i18n.t('account.read.done');
                client = common.setDataToClient(user);
                result = feedback.done(msg, client);

                res.json(result);
            } else {
                msg = i18n.t('account.read.mismatch');
                result = feedback.done(msg, params);

                res.json(result);
            }
        });
    });

    next();
};

// mailing for forgot password account
exports.mailingResetPassword = function (req, res, next) {
    var params = {
        email: req.params['email'],
        password: req.params['password'],
        serviceMailer: res.coreMailer,
        serviceHost: res.coreHost,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({email: params.email}, function (err, existAccount) {
        if (err || !existAccount || !existAccount.email) {
            msg = i18n.t('account.forgotPassword.fail');
            result = feedback.done(msg, params);

            return res.json(result);
        }

        var randomToken = common.getRandomToken();
        var expired = common.getPasswordResetExpire();

        existAccount.reset_password_token = randomToken;
        existAccount.reset_password_token_expire = expired;
        existAccount.save();

        // send mail
        if (params.serviceMailer.delegate) {
            sendmail.sendPasswordResetMailByDelegate(existAccount.email,
                {link: params.serviceHost + '/account/update-password/' + randomToken},
                params.serviceMailer.delegate,
            function (result) {
                //
            });
        } else {
            // todo: custom mailer
            //sendmail.sendPasswordResetMail();
            console.log('\n=== send mail to account for password reset!\n');
        }

        //AccountLog.resetPasswordMail({email: params['email']});

        msg = i18n.t('account.forgotPassword.done');
        client = common.setDataToClient(existAccount);
        result = feedback.done(msg, client);

        res.json(result);
    });

    next();
};

// validate token
exports.validateToken = function (req, res) {
    var params = {
        keepToken: req.params['keep'],
        accessToken: res.accessToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    // keep or remove or validate only
    switch (params.keepToken) {
        case '1':
            AccountToken.findOne({access_token: params.accessToken, access_host: params.accessHost}, function (err, existToken) {
                if (err || !existToken) {
                    msg = i18n.t('token.read.notExist');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                if (common.isThisTokenExpired(existToken)) {
                    msg = i18n.t('token.read.expired');
                    result = feedback.unauthorized(msg, params);

                    return res.json(result.statusCode, result);
                } else {
                    // keep this token once more
                    existToken.login_expire = common.getLoginExpireDate();
                    existToken.save(function (err, token) {
                        if (err) {
                            msg = i18n.t('token.keep.fail');
                            result = feedback.done(msg, params);

                            return res.json(result);
                        }

                        msg = i18n.t('token.keep.done');
                        result = feedback.done(msg, params);

                        //AccountLog.checkToken({token: params.accessToken});
                        return res.json(result);
                    });
                }
            });

            break;
        case '0':
            AccountToken.findOne({access_token: params.accessToken, access_host: params.accessHost}, function (err, existToken) {
                if (err || !existToken) {
                    msg = i18n.t('token.read.notExist');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                if (common.isThisTokenExpired(existToken)) {
                    msg = i18n.t('token.read.expired');
                    result = feedback.unauthorized(msg, params);

                    return res.json(result.statusCode, result);
                } else {
                    // remove token information
                    existToken.remove(function (err, token) {
                        if (err) {
                            msg = i18n.t('token.delete.fail');
                            result = feedback.done(msg, params);

                            return res.json(result);
                        }

                        // done right
                        msg = i18n.t('token.delete.done');
                        result = feedback.done(msg, params);

                        //AccountLog.checkToken({token: params.accessToken});
                        return res.json(result);
                    });
                }
            });

            break;
        default :
            AccountToken.findOne({access_token: params.accessToken, access_host: params.accessHost}, function (err, existToken) {
                if (err || !existToken) {
                    msg = i18n.t('token.read.notExist');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                if (common.isThisTokenExpired(existToken)) {
                    msg = i18n.t('token.read.expired');
                    result = feedback.unauthorized(msg, params);

                    return res.json(result.statusCode, result);
                } else {
                    // reading right
                    msg = i18n.t('token.read.done');
                    result = feedback.done(msg, params);

                    //AccountLog.checkToken({token: params.accessToken});
                    return res.json(result);
                }
            });
    }
};
