var feedback = require('../feedback');

// signup
exports.createAccount = function (req, res, next) {
    var params = {
        email: req.params.email,
        password: req.params.password,
        nickname: req.params.nickname,
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        database: res.coreDatabase
    };

    var result = feedback.done('created account', params);
    //params.result = Code.account.create.validation;
    //params.result.validation = errors;

    res.json(result);

    return next();

    //Account.createByEmail(params, function (result) {
    //    res.send(result);
    //});
};
