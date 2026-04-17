const express = require('express');
const router = express.Router();
const {
    createResourceRequest,
    respondToResourceRequest,
    getAllResourceRequests,
    getResourceStats,
    cancelResourceRequest
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createResourceRequest);
router.post('/respond', protect, respondToResourceRequest);
router.get('/all', protect, getAllResourceRequests);
router.get('/stats', protect, getResourceStats);
router.delete('/cancel/:id', protect, cancelResourceRequest);

module.exports = router;
