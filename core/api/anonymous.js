var i18n = require('i18next');

var feedback = require('../lib/feedback');

var Document = require('../models/anonymousDocument');

exports.createDocument = function (req, res, next) {
    var params = {
        title: req.params['title'],
        text: req.params['text'],
        author: req.params['author']
    };

    var msg, result;

    var document = new Document({
        title: params.title,
        text: params.text,
        author: params.author,
        view_count: 0,
        commend_count: 0,
        alert_count: 0,
        created_at: Date.now()
    });

    if (params.text) {
        document.save(function (err) {
            if (err) {
                msg = i18n.t('anonymous.create.fail');
                result = feedback.badImplementation(msg, err);

                return res.json(result.statusCode, result);
            }

            // done right
            msg = i18n.t('anonymous.create.done');

            result = feedback.done(msg, document);

            res.json(result);
        });
    } else {
        msg = i18n.t('anonymous.create.fail');

        result = feedback.badData(msg, document);

        res.json(result);
    }
};
