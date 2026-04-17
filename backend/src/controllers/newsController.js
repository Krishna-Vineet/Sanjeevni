const asyncHandler = require('express-async-handler');
const News = require('../models/News');

// @desc    Broadcast news to the network
// @route   POST /api/news/broadcast
// @access  Private
const broadcastNews = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const hospital_id = req.hospital.hospital_id;

    const news = new News({
        hospital_id,
        title,
        content,
        source: req.hospital.name
    });

    await news.save();
    res.status(201).json({ status: "published", news_id: news._id });
});

// @desc    Get all news (including system/external)
// @route   GET /api/news/latest
// @access  Public
const getLatestNews = asyncHandler(async (req, res) => {
    // 1. Fetch from DB only (hospital broadcasts)
    const localNews = await News.find().sort({ createdAt: -1 }).limit(5);

    res.json({ news: localNews });
});

module.exports = { broadcastNews, getLatestNews };
