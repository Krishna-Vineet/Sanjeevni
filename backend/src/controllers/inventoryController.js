const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');

// @desc    Get hospital inventory
// @route   GET /api/inventory
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
    let inventory = await Inventory.findOne({ hospital_id: req.hospital._id });
    
    // If no inventory exists yet, create an empty one with some defaults
    if (!inventory) {
        inventory = new Inventory({
            hospital_id: req.hospital._id,
            items: [
                { name: 'Oxygen Cylinders', category: 'supplies', quantity: 50, unit: 'units', min_threshold: 15 },
                { name: 'ICU Ventilators', category: 'equipment', quantity: 15, unit: 'units', min_threshold: 5 },
                { name: 'Paracetamol', category: 'medicine', quantity: 1000, unit: 'tablets', min_threshold: 200, expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
                { name: 'PPE Kits', category: 'supplies', quantity: 200, unit: 'units', min_threshold: 50 },
                { name: 'Amoxicillin', category: 'medicine', quantity: 500, unit: 'units', min_threshold: 100, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                { name: 'Defibrillators', category: 'equipment', quantity: 4, unit: 'units', min_threshold: 2 }
            ]
        });
        await inventory.save();
    }

    res.json(inventory);
});

// @desc    Update inventory item
// @route   PUT /api/inventory
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
    const { items } = req.body;
    let inventory = await Inventory.findOne({ hospital_id: req.hospital._id });
    
    if (inventory) {
        inventory.items = items;
        await inventory.save();
    } else {
        inventory = await Inventory.create({
            hospital_id: req.hospital._id,
            items
        });
    }

    res.json(inventory);
});

// @desc    Get ML surge prediction and resource gap
// @route   GET /api/inventory/prediction
// @access  Private
const getSurgePrediction = asyncHandler(async (req, res) => {
    // Mock ML output
    // In a real scenario, this would call an external ML model (FastAPI/Python)
    const surgeMultiplier = 1.45; // 45% projected increase in 7 days
    const days = 7;

    const inventory = await Inventory.findOne({ hospital_id: req.hospital._id });
    const items = inventory ? inventory.items : [];

    // Calculate gap and alerts
    const predictions = items.map(item => {
        const projectedUsage = item.quantity * surgeMultiplier;
        const gap = Math.max(0, Math.ceil(projectedUsage - item.quantity));
        const isBelowThreshold = item.quantity <= item.min_threshold;
        
        // Expiry alert (if within 45 days)
        const isExpiring = item.expiry_date ? (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) < 45 : false;

        return {
            name: item.name,
            current: item.quantity,
            projected_need: Math.ceil(projectedUsage),
            gap,
            is_low_stock: isBelowThreshold,
            is_expiring: isExpiring,
            priority: gap > 20 || isBelowThreshold ? 'critical' : gap > 0 || isExpiring ? 'warning' : 'stable'
        };
    });

    res.json({
        projected_surge: "+45%",
        timeframe: "7 Days",
        risk_level: "High",
        recommendations: predictions
    });
});

module.exports = {
    getInventory,
    updateInventory,
    getSurgePrediction
};
