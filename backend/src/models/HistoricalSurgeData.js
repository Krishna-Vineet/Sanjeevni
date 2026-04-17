const mongoose = require('mongoose');

const historicalSurgeDataSchema = new mongoose.Schema({
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: Date, required: true },
    patient_count: { type: Number, required: true },
    resource_utilization: { type: Number, required: true } // 0.0 to 1.0
}, { timestamps: true });

module.exports = mongoose.model('HistoricalSurgeData', historicalSurgeDataSchema);
