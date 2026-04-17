const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema({
    request_id: { type: String, required: true, unique: true, index: true },
    origin_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patient_name: { type: String },
    severity: { type: String }, // critical, moderate, stable
    condition: { type: String },
    required_resources: { type: [String], default: [] }, // ["ICU", "VENTILATOR"]
    notes: { type: String },
    location_lat: { type: Number },
    location_lng: { type: Number },
    status: { type: String, default: 'created' }, // created, pending, broadcasted, confirmed, completed
    assigned_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
    broadcasted_hospitals: { type: [String], default: [] }, // list of hospital_id strings
    top_3_priority_ids: { type: [String], default: [] } // hospital_id of top 3 matches for auto-approval
}, { timestamps: true });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
