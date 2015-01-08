var i18n = require('i18next');

exports.testSimple = function (req, res) {
    res.json({msg: "hi"});
};

exports.testSimpleWithParam = function (req, res) {
    var params = {
        name: req.params.name
    };

    res.json({msg: "hi", params: params});
};

exports.testI18N = function (req, res) {
    res.json({msg: i18n.t('app.lang.testMsg')});
};

exports.testEnForce = function (req, res) {
    i18n.setLng('en', function (t) {
        //res.json({msg: 'locale: ' + i18n.lng() + ', test message: ' + t('app.lang.testMsg')});
        res.json({msg: t('app.lang.testMsg')});
    });
};

exports.testVersion1 = function (req, res) {
    res.json({msg: "version: 1.0.x"})
};

exports.testVersion1_2_3 = function (req, res) {
    res.json({msg: "version: 1.2.3"})
};

exports.testVersion2 = function (req, res) {
    res.json({msg: "version: 2.x.x"})
};

exports.testCustomParams = function (req, res) {
    var params = {
        host: res.accessHost,
        ip: res.accessIP
    };

    req.log.debug({params: req.params}, 'Hello there %s', 'foo');

    res.json({msg: "custom param in route", data: params});
};
