const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
    resource_request_id: { type: String, required: true, unique: true, index: true },
    requesting_hospital_id: { type: String, required: true },
    resource_type: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'units' },
    priority: { type: String, default: 'normal' }, // normal, urgent, emergency
    status: { type: String, default: 'pending' }, // pending, accepted, shipped, delivered, completed
    fulfilled_by: { type: String, default: null },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
