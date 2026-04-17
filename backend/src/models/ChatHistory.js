const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    hospital_id: { type: String, required: true }, // The hospital asking the AI
    messages: [
        {
            role: { type: String, enum: ['user', 'model'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
