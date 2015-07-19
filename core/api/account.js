var i18n = require('i18next');

var feedback = require('../lib/feedback');
var common = require('../lib/common');
var sendmail = require('../lib/sendmail');

var Account = require('../models/account');
var AccountToken = require('../models/accountToken');

// middleware: check token validate for this account
exports.getValidateToken = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        accessToken: res.accessToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

    AccountToken.findOne({access_token: params.accessToken, access_host: params.accessHost, haroo_id: params.haroo_id},
        function (err, existToken) {
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
                res.clientToken = existToken;
            }

            next();
        });
};

// signup
exports.createAccount = function (req, res, next) {
    var params = {
        email: req.params['email'],
        password: req.params['password'],
        nickname: req.params['nickname'],
        joinFrom: req.params['client_id'],
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        database: res.coreDatabase['host'] + (res.coreDatabase['port'] ? ':' + res.coreDatabase['port'] : '')
    };

    var msg, client, result;

    Account.findOne({ email: params.email }, function(err, existUser) {
        if (err || existUser) {
            msg = i18n.t('account.create.exist');
            result = feedback.preconditionFailed(msg, params);

            return res.json(result.statusCode, result);
        }

        // make new account
        var haroo_id = common.initHarooID(params.email, res.coreDatabase);

        if (!haroo_id) {
            //throw new Error('no exist haroo id!');
            msg = i18n.t('account.create.fail');
            result = feedback.badImplementation(msg, params);

            return res.json(result.statusCode, result);
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
                result = feedback.badImplementation(msg, err);

                return res.json(result.statusCode, result);
            }

            // save account to mongo
            user.save(function (err) {
                if (err) {
                    msg = i18n.t('account.create.fail');
                    result = feedback.badImplementation(msg, err);

                    return res.json(result.statusCode, result);
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
                        result = feedback.badImplementation(msg, err);

                        return res.json(result.statusCode, result);
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

    Account.findOne({email: params.email}, function (err, existUser) {
        if (!existUser) {
            msg = i18n.t('account.read.mismatch');
            result = feedback.unauthorized(msg, params);

            return res.json(result.statusCode, result);
        }
        existUser.comparePassword(params.password, function (err, isMatch) {
            if (isMatch) {
                // remove previous token for access IP and Host
                AccountToken.remove({haroo_id: existUser.haroo_id, access_ip: params.accessIP, access_host: params.accessHost}, function (err) {
                    if (err) {
                        msg = i18n.t('token.delete.fail');
                        result = feedback.badImplementation(msg, params);

                        return res.json(result.statusCode, result);
                    }

                    // make new account token
                    var token = new AccountToken({
                        access_ip: params['accessIP'],
                        access_host: params['accessHost'],
                        access_token: common.getAccessToken(),
                        haroo_id: existUser.haroo_id,
                        login_expire: common.getLoginExpireDate(),
                        created_at: Date.now()
                    });

                    token.save(function (err) {
                        if (err) {
                            msg = i18n.t('token.create.fail');
                            result = feedback.badImplementation(msg, params);

                            return res.json(result.statusCode, result);
                        }


                        // done right
                        msg = i18n.t('account.read.done');
                        client = common.setDataToClient(existUser, token);
                        result = feedback.done(msg, client);

                        //AccountLog.signIn({email: params['email']});
                        res.json(result);
                    });
                });
            } else {
                msg = i18n.t('account.read.mismatch');
                result = feedback.unauthorized(msg, params);

                res.json(result.statusCode, result);
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
            params.serviceMailer = undefined; // clear mailer info
            params.serviceHost = undefined; // clear host info
            result = feedback.preconditionFailed(msg, params);

            return res.json(result.statusCode, result);
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
            //console.error('\n=== fake: send mail to account for password reset!\n');
        }

        //AccountLog.resetPasswordMail({email: params['email']});

        msg = i18n.t('account.forgotPassword.done');
        client = common.setDataToClient(existAccount);
        result = feedback.done(msg, client);

        res.json(result);
    });

    next();
};

// update password for reset
exports.updatePasswordForReset = function (req, res, next) {
    var params = {
        token: req.params['token'],
        password: req.params['password']
    };

    var msg, result;

    Account.findOne({ reset_password_token: params.token })
        .where('reset_password_token_expire').gt(Date.now())
        .exec(function (err, accountForReset) {
            if (err || !accountForReset) {
                msg = i18n.t('account.resetPassword.notExist');
                result = feedback.badRequest(msg, params);

                return res.json(result.statusCode, result);
            }

            accountForReset.password = params.password;
            accountForReset.reset_password_token = undefined;
            accountForReset.reset_password_token_expire = undefined;

            // force Login process
            accountForReset.save(function (err) {
                if (err) {
                    msg = i18n.t('account.resetPassword.fail');
                    result = feedback.badImplementation(msg, params);

                    return res.json(result.statusCode, result);
                }

                msg = i18n.t('account.resetPassword.done');
                client = common.setDataToClient(accountForReset);
                result = feedback.done(msg, client);

                res.json(result);
            });
        });
};

// validate token
exports.validateToken = function (req, res, next) {
    var params = {
        keepToken: req.params['keep'],
        accessToken: res.accessToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

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
                            result = feedback.badImplementation(msg, params);

                            return res.json(result.statusCode, result);
                        }

                        msg = i18n.t('token.keep.done');
                        params.tokenExpire = existToken.login_expire;
                        result = feedback.done(msg, params);

                        //AccountLog.checkToken({token: params.accessToken});
                        return res.json(result);
                    });
                }
            });

            break;
        case '2':
            AccountToken.findOne({access_token: params.accessToken, access_host: params.accessHost}, function (err, existToken) {
                console.log(existToken);
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
                            result = feedback.badImplementation(msg, params);

                            return res.json(result.statusCode, result);
                        }

                        msg = i18n.t('token.keep.done');
                        params.tokenExpire = existToken.login_expire;
                        params.harooID = existToken.haroo_id;
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
                            result = feedback.badImplementation(msg, params);

                            return res.json(result.statusCode, result);
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

    next();
};

// get user info
exports.accountInfo = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({haroo_id: params.haroo_id}, function (err, existUser) {
        if (err || !existUser) {
            msg = i18n.t('user.info.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        // done right
        msg = i18n.t('user.info.done');
        client = common.setDataToClient(existUser, params.clientToken);
        result = feedback.done(msg, client);

        //AccountLog.accessHarooID({haroo_id: params['haroo_id']});
        return res.json(result);
    });

    next();
};

// update user password
exports.updatePassword = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        email: req.params['email'],
        password: req.params['password'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({haroo_id: params['haroo_id'], email: params['email']}, function (err, updateUser) {
        if (err || !updateUser) {
            msg = i18n.t('user.info.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        // update this new password
        updateUser.password = params['password'];
        updateUser.save(function (err) {
            if (err) {
                msg = i18n.t('user.updatePassword.fail');
                result = feedback.badImplementation(msg, params);

                return res.json(result.statusCode, result);
            }

            // done right
            msg = i18n.t('user.updatePassword.done');
            client = common.setDataToClient(updateUser, params.clientToken);
            result = feedback.done(msg, client);

            //AccountLog.changePassword({email: params['email']});
            return res.json(result);
        });
    });

    next();
};

// update user info
exports.updateAccountInfo = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        email: req.params['email'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({ email: params.email }, function(err, updateUser) {
        if (err || !updateUser) {
            msg = i18n.t('user.update.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        // just for now, only update user's nickname
        updateUser.profile.nickname = req.params['nickname'];
        updateUser.updated_at = Date.now();

        updateUser.save(function (err, affectedUser) {
            if (err) {
                msg = i18n.t('user.update.fail');
                result = feedback.badImplementation(msg, params);

                return res.json(result.statusCode, result);
            }

            msg = i18n.t('user.update.done');
            client = common.setDataToClient(updateUser, params.clientToken);
            result = feedback.done(msg, client);

            //AccountLog.update({email: params['email']});
            return res.json(result);
        });
    });

    next();
};

exports.dismissAccount = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        email: req.params['email'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, client, result;

    Account.findOne({haroo_id: params.haroo_id, email: params.email}, function (err, logoutUser) {
        if (err || !logoutUser) {
            msg = i18n.t('user.dismiss.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        // just remove previous token for access IP and Host
        AccountToken.remove({haroo_id: logoutUser.haroo_id, access_ip: params.accessIP, access_host: params.accessHost}, function (err) {
            if (err) {
                msg = i18n.t('user.dismiss.fail');
                result = feedback.badImplementation(msg, params);

                return res.json(result.statusCode, result);
            }

            msg = i18n.t('user.dismiss.done');
            client = common.setDataToClient(logoutUser, params.clientToken);
            result = feedback.done(msg, client);

            //AccountLog.signOut({email: params['email']});
            return res.json(result);
        });
    });

    next();
};

exports.removeAccount = function (req, res, next) {
    var params = {
        haroo_id: req.params['haroo_id'],
        email: req.params['email'],
        password: req.params['password'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

    Account.findOne({haroo_id: params.haroo_id, email: params.email}, function (err, validUser) {
        if (err || !validUser) {
            msg = i18n.t('user.delete.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }
        validUser.comparePassword(params.password, function (err, isMatch) {
            if (err) {
                msg = i18n.t('user.delete.fail');
                params.clientToken = undefined; // clear token info

                result = feedback.badImplementation(msg, params);

                return res.json(result.statusCode, result);
            }

            if (isMatch) {
                // remove all token for this account
                AccountToken.remove({haroo_id: validUser.haroo_id}, function (err) {
                    if (err) {
                        msg = i18n.t('user.delete.fail');
                        result = feedback.badImplementation(msg, params);

                        return res.json(result.statusCode, result);
                    }

                    // done right
                    Account.remove({id: validUser.id}, function (err, countAffected) {
                        if (err) {
                            msg = i18n.t('user.delete.fail');
                            result = feedback.badImplementation(msg, params);

                            return res.json(result.statusCode, result);
                        }

                        msg = i18n.t('user.delete.done');
                        result = feedback.done(msg, params);
                        // AccountLog.remove({email: params['email']});

                        res.json(result);
                    });
                });

            } else {
                msg = i18n.t('user.delete.mismatch');
                result = feedback.unauthorized(msg, params);

                res.json(result.statusCode, result);
            }
        });
    });

    next();
};