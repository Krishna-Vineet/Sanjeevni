const express = require('express');
const router = express.Router();
const { 
    getInventory, 
    updateInventory, 
    getSurgePrediction 
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInventory);
router.put('/', protect, updateInventory);
router.get('/prediction', protect, getSurgePrediction);

module.exports = router;
