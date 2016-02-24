var mongoose = require('mongoose');

var documentSchema = new mongoose.Schema({
    haroo_id: { type: String, index: true },
    title: String,
    text: String,
    theme: String,
    tag: Array,
    updated_at: { type: Date, index: true },
    created_at: { type: Date, index: true }
});

module.exports = mongoose.model('document', documentSchema);