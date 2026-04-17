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
    // 1. Fetch from DB (hospital and system broadcasts)
    const localNews = await News.find().sort({ createdAt: -1 }).limit(10);
    
    // 2. Mock external news from "APIs" as requested
    const externalNews = [
        {
            title: "WHO reports decline in global respiratory cases",
            content: "Recent data shows a 15% decrease in seasonal respiratory infections...",
            source: "World Health Organization",
            is_external: true,
            createdAt: new Date()
        },
        {
            title: "Gurgaon Health Dept issues protocol update",
            content: "All network hospitals are required to update their ICU oxygen logs daily.",
            source: "Haryana Health Dept",
            is_external: true,
            createdAt: new Date()
        }
    ];

    const allNews = [...localNews, ...externalNews].sort((a, b) => b.createdAt - a.createdAt);

    res.json({ news: allNews });
});

module.exports = { broadcastNews, getLatestNews };
