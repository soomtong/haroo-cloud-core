
// signup
exports.createAccount = function (req, res) {
    var params = {
        email: req.params.email,
        password: req.params.password,
        nickname: req.params.nickname,
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        database: res.accessDatabase,
        result: {}
    };

    console.log(params);

    if (errors) {
        //params.result = Code.account.create.validation;
        params.result.validation = errors;

        res.send(params.result);
        return;
    }

    //Account.createByEmail(params, function (result) {
    //    res.send(result);
    //});
};
