const express = require('express');
const router = express.Router();
const {
    createTransfer,
    matchHospitals,
    broadcastTransfer,
    getTransferStatus,
    finalizeAssignment,
    getTransferHistory
} = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createTransfer);
router.get('/match/:request_id', protect, matchHospitals);
router.post('/broadcast', protect, broadcastTransfer);
router.get('/history', protect, getTransferHistory);
router.get('/:request_id', protect, getTransferStatus);
router.post('/finalize', protect, finalizeAssignment);

module.exports = router;
