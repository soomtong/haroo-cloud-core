var mongoose = require('mongoose');

var publicDocSchema = new mongoose.Schema({
    doc_id: Schema.Types.ObjectId,
    comment: String,
    type: String,   // commend, claim
    ip: String,
    created_at: Date
});

module.exports = mongoose.model('anonymous_feedback', publicDocSchema);