const express = require('express');
const router = express.Router();
const {
    respondToTransfer,
    getIncomingRequests,
    updateCapacity,
    updateSettings
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/respond', protect, respondToTransfer);
router.get('/requests', protect, getIncomingRequests); // Note: /api/hospital/requests doesn't need ID in URL now as it uses token
router.put('/capacity', protect, updateCapacity);
router.put('/settings', protect, updateSettings);

module.exports = router;
