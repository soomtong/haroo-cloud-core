var i18n = require('i18next');

var feedback = require('../lib/feedback');
var common = require('../lib/common');

var Document = require('../models/anonymous_document');
var FeedbackDocument = require('../models/anonymous_feedback');

var urlPrefix = '/api/tree/doc/';

var anonymousList = {
    page: 0,
    size: 10,
    defaultOrder: 'newest'
};

exports.createDocument = function (req, res, next) {
    var params = {
        title: req.params['title'],
        theme: req.params['theme'] || '',
        text: req.params['text'],
        keptDate: req.params['hasKeep'] ? req.params['keep'] : undefined,
        author: req.params['author'] || 'anonymous'
    };

    var msg, result, keepDate;

    if (params.keptDate) {
        keepDate = new Date();
        keepDate.setUTCFullYear(Number(params.keptDate['year']), Number(params.keptDate['month']) - 1, Number(params.keptDate['date']));
    }

    var document = new Document({
        title: params.title,
        text: params.text,
        theme: params.type,
        author: params.author,
        view_count: 0,
        commend_count: 0,
        alert_count: 0,
        kept_at: keepDate,
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
        theme: req.params['t']
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
            listOrder = { view_count: -1 };
            break;
        case 'coldest':
            listOrder = { view_count: 1 };
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

                list.forEach(function (item) {
                    item.text = common.getHeaderTextFromMarkdown(item.text, 280);
                });

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

exports.curateDocument = function (req, res, next) {
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
            listOrder = { view_count: -1 };
            break;
        case 'coldest':
            listOrder = { view_count: 1 };
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

    var curateFilter = { curate: true };

    Document.count(curateFilter, function (error, count) {
        // count all list
        if (count) {
            Document.find(curateFilter, { /* all fields */ }, {
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

                list.forEach(function (item) {
                    item.text = common.getHeaderTextFromMarkdown(item.text, 280);
                });

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

exports.todayDocument = function (req, res, next) {
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
            listOrder = { view_count: -1 };
            break;
        case 'coldest':
            listOrder = { view_count: 1 };
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

    //var today = new Date();
    //var yesterday = new Date(today.setDate(today.getDate() - 1));
    //var someday = new Date();
    //someday.setDate(someday.getDate() - 1);
    var yesterday = Date.now() - 86400000;   // 86400000
    var todayFilter = { created_at: { $gte: yesterday } };

    Document.count(todayFilter, function (error, count) {
        // count all list
        if (count) {
            Document.find(todayFilter, { /* all fields */ }, {
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

                list.forEach(function (item) {
                    item.text = common.getHeaderTextFromMarkdown(item.text, 280);
                });

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

exports.selectedListDocument = function (req, res, next) {
    var params = {
        order: req.params['order'] || anonymousList.defaultOrder,
        list: req.params['list'] || []
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
            listOrder = { view_count: -1 };
            break;
        case 'coldest':
            listOrder = { view_count: 1 };
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

    var selectedFilter = { _id: { $in: params.list } };

    Document.count(selectedFilter, function (error, count) {
        if (error) {
            msg = i18n.t('anonymous.list.fail');
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }
        // count all list
        if (count) {
            Document.find(selectedFilter, { /* all fields */ }, {
                sort: listOrder
            }, function (error, list) {
                if (error || !list) {
                    msg = i18n.t('anonymous.list.fail');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                msg = i18n.t('anonymous.list.done');

                list.forEach(function (item) {
                    item.text = common.getHeaderTextFromMarkdown(item.text, 280);
                });

                listData = {
                    list: list,
                    count: list.length
                };

                result = feedback.done(msg, listData);

                res.json(result);
            });
        } else {
            msg = i18n.t('anonymous.list.empty');

            listData = {
                list: [],
                count: 0
            };

            result = feedback.done(msg, listData);

            res.json(result);
        }
    });

    next();
};

exports.searchDocument = function (req, res, next) {
    var params = {
        order: req.params['order'] || anonymousList.defaultOrder,
        query: req.params['query'] || ''
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
            listOrder = { view_count: -1 };
            break;
        case 'coldest':
            listOrder = { view_count: 1 };
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

    var selectedFilter = {
        $or: [
            { text: new RegExp(params.query, 'gi') },
            { title: new RegExp(params.query, 'gi') }
        ]
    };

    Document.find(selectedFilter, { /* all fields */ }, {
        sort: listOrder
    }, function (error, list) {
        if (error || !list) {
            msg = i18n.t('anonymous.list.fail');
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        msg = i18n.t('anonymous.list.done');

        list.forEach(function (item) {
            item.text = common.getHeaderTextFromMarkdown(item.text, 280);
        });

        listData = {
            list: list,
            count: list.length
        };

        result = feedback.done(msg, listData);

        res.json(result);
    });


/*
    Document.count(selectedFilter, function (error, count) {
        if (error) {
            msg = i18n.t('anonymous.list.fail');
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }
        // count all list
        if (count) {
            Document.find(selectedFilter, { /!* all fields *!/ }, {
                sort: listOrder
            }, function (error, list) {
                if (error || !list) {
                    msg = i18n.t('anonymous.list.fail');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                msg = i18n.t('anonymous.list.done');

                list.forEach(function (item) {
                    item.text = common.getHeaderTextFromMarkdown(item.text, 280);
                });

                listData = {
                    list: list,
                    count: list.length
                };

                result = feedback.done(msg, listData);

                res.json(result);
            });
        } else {
            msg = i18n.t('anonymous.list.empty');

            listData = {
                list: [],
                count: 0
            };

            result = feedback.done(msg, listData);

            res.json(result);
        }
    });
*/

    next();
};

exports.statDocument = function (req, res, next) {
    // total view count and view count for daily with feedback stats

    next();
};

exports.feedbackDocument = function (req, res, next) {
    // restrict for IP per 1 day
    var params = {
        id: req.params['doc_id'],
        type: req.params['type'],
        acc: req.params['acc'],
        ip: res.accessIP
    };

    var msg, result;

    // retrieve and update stat document
    FeedbackDocument.findOne({ doc_id: params.id, ip: params.ip, type: params.type }, function (error, feedbackDocument) {
        if (error) {
            msg = i18n.t('anonymous.feedback.fail');
            result = feedback.badRequest(msg, params);

            return res.json(result.statusCode, result);
        }

        /* FeedbackDocument Conditions
        * +1 and exist: pass
        * +1 and not exist: insert and update
        * -1 and exist: remove and update
        * -1 and not exist: pass
        * */

        if (params.acc == '+1' && !feedbackDocument) {
            var feedbackDoc = new FeedbackDocument({
                doc_id: params.id,
                comment: '',
                type: params.type,
                ip: params.ip,
                created_at: Date.now()
            });

            // save feedbackDocument
            feedbackDoc.save(function (error) {
                if (error) {
                    msg = i18n.t('anonymous.feedback.fail');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                // update document
                Document.findById(params.id, function (error, document) {
                    var type = params.type + '_count';

                    document[type] = document[type] ? document[type] + 1 : 1;

                    document.save(function (error) {
                        if (error) {
                            msg = i18n.t('anonymous.update.fail');
                            result = feedback.badRequest(msg, params);

                            return res.json(result.statusCode, result);
                        }

                        msg = i18n.t('anonymous.feedback.done');
                        result = feedback.done(msg, document);

                        return res.json(result);
                    });
                });
            });
        } else if (params.acc == '-1' && feedbackDocument) {
            // remove feedback
            feedbackDocument.remove(function (error) {
                if (error) {
                    msg = i18n.t('anonymous.feedback.fail');
                    result = feedback.badRequest(msg, params);

                    return res.json(result.statusCode, result);
                }

                // update document
                Document.findById(params.id, function (error, document) {
                    var type = params.type + '_count';

                    document[type] = document[type] ? document[type] - 1 : 0;

                    document.save(function (error) {
                        if (error) {
                            msg = i18n.t('anonymous.update.fail');
                            result = feedback.badRequest(msg, params);

                            return res.json(result.statusCode, result);
                        }

                        msg = i18n.t('anonymous.feedback.done');
                        result = feedback.done(msg, document);

                        return res.json(result);
                    });
                });
            });
        } else {
            msg = i18n.t('anonymous.feedback.pass');
            result = feedback.done(msg, params);

            res.json(result);
        }
    });

    next();
};
