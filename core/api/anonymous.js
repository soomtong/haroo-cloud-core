var i18n = require('i18next');

var feedback = require('../lib/feedback');

var Document = require('../models/anonymousDocument');

var urlPrefix = '/api/tree/doc/';

var anonymousList = {
    page: 0,
    size: 10,
    defaultOrder: 'newest'
};

exports.createDocument = function (req, res, next) {
    var params = {
        title: req.params['title'],
        type: req.params['type'] || 'text',
        text: req.params['text'],
        kept_at: req.params['kept'],
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
        kept_at: params.kept_at,
        updated_at: Date.now(),
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

exports.listDocument = function (req, res, next) {
    var params = {
        order: req.params['order'] || anonymousList.defaultOrder,
        page: req.params['p'] || anonymousList.page,
        size: req.params['s'] || anonymousList.size
    };

    var msg, result, listOrder, listData;

    switch (params.order) {
        case 'newest':
            listOrder = { created_at: -1 };
            break;
        case 'oldest':
            listOrder = { created_at: 1 };
            break;
        case 'hottest':
            listOrder = { view_count: 1 };
            break;
        case 'coldest':
            listOrder = { view_count: -1 };
            break;
        case 'commended':
            listOrder = { commend_count: 1 };
            break;
        case 'claimed':
            listOrder = { claim_count: 1 };
            break;
        default :
            listOrder = { created_at: -1 };
            break;
    }
    Document.count({}, function (error, count) {
        // count all list
        if (count) {
            Document.find({}, { /* all fields */ }, {
                sort: listOrder,
                skip: (params.page * params.size),
                limit: params.size
            }, function (error, list) {
                if (error || !list) {
                    msg = i18n.t('anonymous.list.fail');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                msg = i18n.t('anonymous.list.done');

                listData = {
                    list: list,
                    now: params.page,
                    size: params.size,
                    count: list.length,
                    total: Math.floor(count / params.size) + ((count % params.size) ? 1 : 0)
                };

                result = feedback.done(msg, listData);

                res.json(result);
            });
        } else {
            msg = i18n.t('anonymous.list.empty');

            listData = {
                list: [],
                now: params.page,
                size: params.size,
                count: 0,
                total: 0
            };

            result = feedback.done(msg, listData);

            res.json(result);
        }
    });

    next();
};

exports.statDocument = function (req, res, next) {
    // total view count and view count for daily with feedback stats

    next();
};


exports.feedbackDocument = function (req, res, next) {
    // restrict for IP per 1 day

    next();
};
