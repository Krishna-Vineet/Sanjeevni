const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    hospital_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
        unique: true
    },
    items: [
        {
            name: { type: String, required: true },
            category: { type: String, required: true }, // 'equipment', 'medicine', 'supplies'
            quantity: { type: Number, default: 0 },
            unit: { type: String, default: 'units' },
            min_threshold: { type: Number, default: 10 },
            batch_number: { type: String },
            expiry_date: { type: Date },
            last_updated: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
