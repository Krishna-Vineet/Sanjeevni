const express = require('express');
const router = express.Router();
const { broadcastNews, getLatestNews } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/broadcast', protect, broadcastNews);
router.get('/latest', getLatestNews);

module.exports = router;
