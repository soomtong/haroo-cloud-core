var i18n = require('i18next');

exports.testSimple = function (req, res, next) {
    res.json({msg: "hi"});

    next();
};

exports.testSimpleWithParam = function (req, res, next) {
    var params = {
        name: req.params.name
    };

    res.json({msg: "hi", params: params});

    next();
};

exports.testI18N = function (req, res, next) {
    res.json({msg: i18n.t('app.lang.testMsg')});

    next();
};

exports.testEnForce = function (req, res, next) {
    i18n.setLng('en', function (t) {
        //res.json({msg: 'locale: ' + i18n.lng() + ', test message: ' + t('app.lang.testMsg')});
        res.json({msg: t('app.lang.testMsg')});
    });

    next();
};

exports.testVersion1 = function (req, res, next) {
    res.json({msg: "version: 1.0.x"})

    next();
};

exports.testVersion1_2_3 = function (req, res, next) {
    res.json({msg: "version: 1.2.3"})

    next();
};

exports.testVersion2 = function (req, res, next) {
    res.json({msg: "version: 2.x.x"})

    next();
};

exports.testCustomParams = function (req, res, next) {
    var params = {
        host: res.accessHost,
        ip: res.accessIP
    };

    res.json({msg: "custom param in route", data: params});

    next();
};

exports.noAccessToken = function (req, res, next) {
    res.json({msg: "should be forbidden"});

    next();
};

var meta = {
    "message": "OK: done",
    "data": {
        "email": "soomtong@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "29478ae2-4c19-457e-aaac-74fef36d208e",
        "login_expire": "1422973044455",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}