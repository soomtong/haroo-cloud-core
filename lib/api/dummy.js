var i18n = require('i18next');

exports.testSimple = function (req, res) {
    res.json({msg: "hi"});
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
    res.json({msg: "version: 1.x.x"})
};

exports.testVersion2 = function (req, res) {
    res.json({msg: "version: 2.x.x"})
};

