const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    hospital_id: { type: String, default: 'SYSTEM' }, // Who published it
    title: { type: String, required: true },
    content: { type: String, required: true },
    source: { type: String, default: 'Sanjeevni Network' },
    is_external: { type: Boolean, default: false } // True if from news API
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
