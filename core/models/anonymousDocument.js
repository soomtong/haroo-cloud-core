var mongoose = require('mongoose');

var publicDocSchema = new mongoose.Schema({
    title: String,
    text: String,
    type: String,
    author: String,
    created_at: Date,
    view_count: Number,
    commend_count: Number,
    alert_count: Number
});

module.exports = mongoose.model('anonymous_document', publicDocSchema);