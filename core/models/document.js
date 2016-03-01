var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;

var documentSchema = new mongoose.Schema({
    haroo_id: { type: Types.String, index: true },
    title: Types.String,
    text: Types.String,
    //mixed: Types.Mixed,
    theme: Types.String,
    tag: Types.Array,
    token_id: Types.String,
    token_name: Types.String,
    accessed_at: { type: Types.Date, index: true },
    updated_at: { type: Types.Date, index: true },
    created_at: { type: Types.Date, index: true }
});

module.exports = mongoose.model('document', documentSchema);