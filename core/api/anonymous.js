var i18n = require('i18next');

var feedback = require('../lib/feedback');

var Document = require('../models/anonymousDocument');

var urlPrefix = '/api/tree/doc/';

exports.createDocument = function (req, res, next) {
    var params = {
        title: req.params['title'],
        type: req.params['type'] || 'text',
        text: req.params['text'],
        author: req.params['author'] || 'anonymous'
    };

    var msg, result;

    var document = new Document({
        title: params.title,
        text: params.text,
        type: params.type,
        author: params.author,
        view_count: 0,
        commend_count: 0,
        alert_count: 0,
        created_at: Date.now()
    });

    if (params.text) {
        document.save(function (error) {
            if (error) {
                msg = i18n.t('anonymous.create.fail');
                result = feedback.badImplementation(msg, error);

                return res.json(result.statusCode, result);
            }

            // done right
            var data = {
                _id: document._id,
                url: urlPrefix + document._id
            };

            msg = i18n.t('anonymous.create.done');
            result = feedback.done(msg, data);

            res.json(result);
        });
    } else {
        msg = i18n.t('anonymous.create.fail');
        result = feedback.badData(msg, document);

        res.json(result);
    }

    next();
};

exports.readDocument = function (req, res, next) {
    var params = {
        id: req.params['doc_id'],
        type: req.params['type']
    };

    var msg, result;

    Document.findById(params.id, function (error, document) {
        if (error || !document) {
            msg = i18n.t('anonymous.read.fail');
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        document.view_count++;

        document.save(function (error) {
            if (error) {
                msg = i18n.t('anonymous.read.fail');
                result = feedback.badRequest(msg, params);

                return res.json(result.statusCode, result);
            }
        });

        // for cli output
        if (params.output == 'terminal') {

        }

        // for render markdown
        if (params.output == 'html') {

        }

        msg = i18n.t('anonymous.read.done');
        result = feedback.done(msg, document);

        res.json(result);

    });

    next();
};

exports.statDocument = function (req, res, next) {

    next();
};

exports.listDocument = function (req, res, next) {

    next();
};

exports.feedbackDocument = function (req, res, next) {
    // restrict for IP per 1 day

    next();
};
