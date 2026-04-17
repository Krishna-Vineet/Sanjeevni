const express = require('express');
const router = express.Router();
const {
    createResourceRequest,
    respondToResourceRequest,
    getAllResourceRequests,
    getResourceStats,
    cancelResourceRequest,
    updateLogisticsStatus
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createResourceRequest);
router.post('/respond', protect, respondToResourceRequest);
router.put('/logistics/:id', protect, updateLogisticsStatus);
router.get('/all', protect, getAllResourceRequests);
router.get('/stats', protect, getResourceStats);
router.delete('/cancel/:id', protect, cancelResourceRequest);

module.exports = router;
