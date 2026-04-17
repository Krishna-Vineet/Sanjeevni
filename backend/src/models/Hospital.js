const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    hospital_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    location_lat: { type: Number, required: true },
    location_lng: { type: Number, required: true },
    rating: { type: Number, default: 4.0 },
    specialization: { type: String },
    password: { type: String, required: true }, // Hashed password
    
    // Capacity
    icu_beds: { type: Number, default: 0 },
    general_beds: { type: Number, default: 0 },
    oxygen_units: { type: Number, default: 0 },
    ventilators: { type: Number, default: 0 },
    
    // Settings
    auto_accept_enabled: { type: Boolean, default: false },
    auto_accept_conditions: { type: mongoose.Schema.Types.Mixed, default: null },
    
    // Elite Reputation
    trust_score: { type: Number, default: 60.0 } // 0-100 scale
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
