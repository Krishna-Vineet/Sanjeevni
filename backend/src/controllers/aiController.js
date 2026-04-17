const asyncHandler = require('express-async-handler');
const aiAssistant = require('../services/aiService');
const ChatHistory = require('../models/ChatHistory');

// @desc    Assist doctor with medical decision & chat history
// @route   POST /api/ai/smart-doctor
// @access  Private
const smartDoctor = asyncHandler(async (req, res) => {
    const { input } = req.body;
    const hospital_id = req.hospital.hospital_id;

    // 1. Get existing history for this hospital
    let history = await ChatHistory.findOne({ hospital_id });
    if (!history) {
        history = new ChatHistory({ hospital_id, messages: [] });
    }

    // 2. Format history for the AI service (last 15 messages)
    const context = history.messages.slice(-15);

    // 3. Get recommendation from Gemini
    const result = await aiAssistant.getClinicalRecommendation(input, context);

    // 4. Update and save history
    history.messages.push({ role: 'user', content: input });
    history.messages.push({ role: 'model', content: result.recommendation });
    
    // Keep internal history manageable (save last 50 for storage, but use 15 for context)
    if (history.messages.length > 50) {
        history.messages = history.messages.slice(-50);
    }
    
    await history.save();

    res.json({
        recommendation: result.recommendation,
        urgency: result.urgency,
        history: history.messages.slice(-10) // Return some history for the UI
    });
});

module.exports = { smartDoctor };
