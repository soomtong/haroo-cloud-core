var mongoose = require('mongoose');

var publicDocSchema = new mongoose.Schema({
    title: String,
    text: String,
    type: String,
    author: String,
    created_at: { type: Date, index: true },
    view_count: { type: Number, index: true },
    commend_count: { type: Number, index: true },
    claim_count: { type: Number, index: true }
});

module.exports = mongoose.model('anonymous_document', publicDocSchema);