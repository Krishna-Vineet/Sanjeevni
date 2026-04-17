const express = require('express');
const router = express.Router();
const { smartDoctor } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/smart-doctor', protect, smartDoctor);

module.exports = router;
