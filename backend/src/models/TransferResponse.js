const mongoose = require('mongoose');

const transferResponseSchema = new mongoose.Schema({
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TransferRequest', required: true },
    hospital_id: { type: String, required: true }, // hospital_id string like "H2"
    action: { type: String, required: true }, // accept, reject
    is_auto: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TransferResponse', transferResponseSchema);
