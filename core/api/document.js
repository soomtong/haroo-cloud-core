var i18n = require('i18next');
var nano = require('nano');

var feedback = require('../lib/feedback');
var common = require('../lib/common');

var Account = require('../models/account');
var PublicDocument = require('../models/publicDocument');

function togglePublicCoreDocument(haroo_id, document_id, shareData) {
    var couch = nano.db.use(haroo_id);

    couch.get(document_id, function (err, coreDocument) {
        if (err) {
            if (err) throw new Error('couch database access denied');
        }
        var meta = coreDocument.meta || {};

        // toggle public url
        meta.share = shareData.isPublic ? shareData.url : undefined;

        // update meta field
        coreDocument.meta = meta;

        // update document
        couch.insert(coreDocument, document_id, function (err) {
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
            togglePublicCoreDocument(params.haroo_id, params.document_id, share);

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
                    togglePublicCoreDocument(params.haroo_id, params.document_id, share);

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