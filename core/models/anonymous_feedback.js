var mongoose = require('mongoose');

var anonymousDocSchema = new mongoose.Schema({
    doc_id: mongoose.Schema.Types.ObjectId,
    comment: String,
    type: String,   // commend, claim
    ip: { type: String, index: true },
    created_at: { type: Date }
});

module.exports = mongoose.model('anonymous_feedback', anonymousDocSchema);