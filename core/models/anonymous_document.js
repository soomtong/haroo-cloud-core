var mongoose = require('mongoose');

var anonymousDocSchema = new mongoose.Schema({
    title: String,
    text: String,
    theme: String,
    author: String,
    curate: { type: Boolean, default: false, index: true },
    kept_at: { type: Date },
    updated_at: { type: Date, index: true },
    created_at: { type: Date, index: true },
    view_count: { type: Number, index: true },
    commend_count: { type: Number, index: true },
    claim_count: { type: Number, index: true }
});

module.exports = mongoose.model('anonymous_document', anonymousDocSchema);