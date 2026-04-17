const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
    resource_request_id: { type: String, required: true, unique: true, index: true },
    requesting_hospital_id: { type: String, required: true },
    resource_type: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, default: 'pending' }, // pending, accepted, fulfilled, closed
    fulfilled_by: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
