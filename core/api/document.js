var i18n = require('i18next');
//var counoun = require('counoun');

var feedback = require('../lib/feedback');
var common = require('../lib/common');

var Account = require('../models/account');
var Document = require('../models/document');
var AccountToken = require('../models/account_token');
var PublicDocument = require('../models/public_document');

function togglePublicCoreDocument(coreDB, document_id, shareData) {
    coreDB.get(document_id, function (err, document) {
        if (err) {
            if (err) throw new Error('couch database access denied');
        }
        var meta = document.meta || {};

        // toggle public url
        meta.share = shareData.isPublic ? shareData.url : undefined;

        // update meta field
        document.meta = meta;

        // update document
        coreDB.put(document_id, document, function (err) {
            if (err) throw new Error('couch database access denied');
        });
    });
}

exports.togglePublic = function (req, res, next) {

    var params = {
        haroo_id: req.params['haroo_id'],
        document_id: req.params['document_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result, share = {};
    var today = common.getToday();

    var coreDB = couch.model(params.haroo_id);

    PublicDocument.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
        if (existDoc) {
            // reuse public url that was published before
            var isPublic = existDoc.public || false;

            existDoc.public = isPublic ? false : true;
            existDoc.save();

            share.isPublic = existDoc.public;

            // just update this document goes public
            if (share.isPublic) {
                share.url = existDoc.release_date + '/' + common.makeZeroFill(Number(existDoc.counter));
            }

            // update core document
            togglePublicCoreDocument(coreDB, params.document_id, share);

            // done
            msg = i18n.t('document.togglePublic.done');
            result = feedback.done(msg, share);

            return res.json(result);
        } else {
            // get today last public document info
            PublicDocument.find({ release_date: today}, null, { limit: 1, sort: {counter: -1}}, function (err, todayLastDoc) {
                if (err) {
                    msg = i18n.t('document.togglePublic.fail');
                    params.clientToken = undefined; // clear token info
                    result = feedback.badImplementation(msg, params);

                    return res.json(result.statusCode, result);
                }

                // count by last document counter for new public document
                var counter = todayLastDoc.length ? Number(todayLastDoc[0].counter) + 1 : 1;  // default counter = 1

                share.url = today + '/' + common.makeZeroFill(counter);
                share.isPublic = true;

                // 새 공유문서 정보 생성
                var shareDoc = new PublicDocument({
                    release_date: today,
                    counter: counter,
                    public: true,
                    haroo_id: params['haroo_id'],
                    document_id: params['document_id']
                });

                shareDoc.save(function (err) {
                    if (err) {
                        msg = i18n.t('document.togglePublic.fail');
                        params.clientToken = undefined; // clear token info
                        result = feedback.badImplementation(msg, params);

                        return res.json(result.statusCode, result);
                    }

                    // 코어 도큐멘트 갱신
                    togglePublicCoreDocument(coreDB, params.document_id, share);

                    // done
                    msg = i18n.t('document.togglePublic.done');
                    result = feedback.done(msg, share);

                    return res.json(result);
                });
            });
        }
    });


    next();
};

/* multi */
exports.createMulti = function (req, res, next) {

    next();
};

exports.readMulti = function (req, res, next) {

    next();
};

exports.updateMulti = function (req, res, next) {

    var params = {
        haroo_id: req.params['haroo_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        type: req.query['type'],
        page: req.query['page'],
        order: req.query['order']
    };

    var listType = (params.type || 'all');
    var orderType = (params.order || 'by_updated_at');

    var msg, result;

    var CoreDB = couch.model(params.haroo_id);

    CoreDB.view(listType, orderType, function (err, coreDocs) {
        if (err) {
            msg = i18n.t('document.retrieveAll.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.notImplemented(msg, params);

            return res.json(result.statusCode, result);
        }

        msg = i18n.t('document.retrieveAll.done');
        result = feedback.done(msg, coreDocs);

        return res.json(result);

    });

    next();
};

exports.deleteMulti = function (req, res, next) {

    var params = {
        haroo_id: req.params['haroo_id'],
        document_id: req.params['document_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

    Account.findOne({ haroo_id: params.haroo_id }, function (err, user) {
        if (err || !user) {
            msg = i18n.t('document.retrieveOne.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badImplementation(msg, params);

            return res.json(result.statusCode, result);
        }

        var coreDB = couch.model(haroo_id);

        coreDB.get(params.document_id, function (err, coreDoc) {
            if (err) {
                console.error(err);

                msg = i18n.t('document.retrieveOne.fail');
                params.clientToken = undefined; // clear token info
                result = feedback.notImplemented(msg, params);

                return res.json(result.statusCode, result);
            }

            msg = i18n.t('document.retrieveOne.done');
            result = feedback.done(msg, coreDoc);

            return res.json(result);

        });
    });

    next();
};

/* single */
exports.createOne = function (req, res, next) {
    var params = {
        title: req.params['title'],
        theme: req.params['theme'] || '',   // follow this order 'type of document like markdown, default is text'/'type of color scheme like monokai, it's optional'
        text: req.params['text'],
        haroo_id: req.params['haroo_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    AccountToken.findOne({ access_token: params.clientToken }, function (err, token) {
        if (err) {
            msg = i18n.t('token.find.fail');
            result = feedback.badImplementation(msg, err);

            return res.json(result.statusCode, result);
        }

        var msg, result;

        var document = new Document({
            title: params.title,
            text: params.text,
            theme: params.theme,
            haroo_id: params.haroo_id,
            token_id: token.access_token,
            token_name: token.access_host,
            accessed_at: Date.now(),
            updated_at: Date.now(),
            created_at: Date.now()
        });

        if (params.text) {
            document.save(function (error) {
                if (error) {
                    msg = i18n.t('document.create.fail');
                    result = feedback.badImplementation(msg, error);

                    return res.json(result.statusCode, result);
                }

                msg = i18n.t('document.create.done');
                result = feedback.done(msg, document);

                res.json(result);
            });
        } else {
            msg = i18n.t('document.create.fail');
            result = feedback.badData(msg, document);

            res.json(result);
        }
    });

    next();
};

exports.readOne = function (req, res, next) {

    next();
};

exports.updateOne = function (req, res, next) {

    var params = {
        haroo_id: req.params['haroo_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP,
        type: req.query['type'],
        page: req.query['page'],
        order: req.query['order']
    };

    var listType = (params.type || 'all');
    var orderType = (params.order || 'by_updated_at');

    var msg, result;

    var CoreDB = couch.model(params.haroo_id);

    CoreDB.view(listType, orderType, function (err, coreDocs) {
        if (err) {
            msg = i18n.t('document.retrieveAll.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.notImplemented(msg, params);

            return res.json(result.statusCode, result);
        }

        msg = i18n.t('document.retrieveAll.done');
        result = feedback.done(msg, coreDocs);

        return res.json(result);

    });

    next();
};

exports.deleteOne = function (req, res, next) {

    var params = {
        haroo_id: req.params['haroo_id'],
        document_id: req.params['document_id'],
        clientToken: res.clientToken,
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

    Account.findOne({ haroo_id: params.haroo_id }, function (err, user) {
        if (err || !user) {
            msg = i18n.t('document.retrieveOne.fail');
            params.clientToken = undefined; // clear token info
            result = feedback.badImplementation(msg, params);

            return res.json(result.statusCode, result);
        }

        var coreDB = couch.model(haroo_id);

        coreDB.get(params.document_id, function (err, coreDoc) {
            if (err) {
                console.error(err);

                msg = i18n.t('document.retrieveOne.fail');
                params.clientToken = undefined; // clear token info
                result = feedback.notImplemented(msg, params);

                return res.json(result.statusCode, result);
            }

            msg = i18n.t('document.retrieveOne.done');
            result = feedback.done(msg, coreDoc);

            return res.json(result);

        });
    });

    next();
};

exports.readPublicDocument = function (req, res, next) {

    var params = {
        date: req.params['date'],
        counter: req.params['counter'],
        counted: req.params['counted'],
        accessHost: res.accessHost,
        accessIP: res.accessIP
    };

    var msg, result;

    PublicDocument.findOne({release_date: params.date, counter: params.counter}, function (err, publicDoc) {
        if (err || !publicDoc || !publicDoc.haroo_id || !publicDoc.document_id) {
            msg = i18n.t('document.retrievePublic.fail');
            result = feedback.badImplementation(msg, params);

            return res.json(result.statusCode, result);
        }

        Account.findOne({haroo_id: publicDoc.haroo_id}, function (err, user) {
            if (err || !user || !user.db_host) {
                msg = i18n.t('document.retrievePublic.fail');
                result = feedback.badImplementation(msg, params);

                return res.json(result.statusCode, result);
            }

            var coreDB = couch.model(user.haroo_id);

            coreDB.get(publicDoc.document_id, function (err, document) {
                if (err || !document) {
                    msg = i18n.t('document.retrievePublic.notExist');
                    result = feedback.notFound(msg, params);

                    return res.json(result.statusCode, result);
                }

                if (!params.counted) {
                    publicDoc.viewCount = publicDoc.viewCount ? publicDoc.viewCount + 1 : 1;
                    publicDoc.save();
                }

                params.doc = document;
                params.meta = publicDoc;

                msg = i18n.t('document.retrievePublic.done');
                result = feedback.done(msg, params);

                return res.json(result);
            });
        });
    });

    next();
};