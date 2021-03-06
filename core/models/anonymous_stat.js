var mongoose = require('mongoose');

var anonymousDocSchema = new mongoose.Schema({
    doc_id: Schema.Types.ObjectId,
    created_at: Date,
    view_count: Number,
    commend_count: Number,
    claim_count: Number
});

module.exports = mongoose.model('anonymous_stat', anonymousDocSchema);