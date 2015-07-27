var mongoose = require('mongoose');

var publicDocSchema = new mongoose.Schema({
    doc_id: Schema.Types.ObjectId,
    created_at: Date,
    view_count: Number,
    commend_count: Number,
    alert_count: Number
});

module.exports = mongoose.model('anonymous_stat', publicDocSchema);