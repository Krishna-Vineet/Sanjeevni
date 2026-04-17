const express = require('express');
const router = express.Router();
const { getNearbyHospitals, seedData } = require('../controllers/systemController');

// Nearby lookup is public as it might be used by patients/emergency dispatchers
router.get('/api/hospitals/nearby', getNearbyHospitals);

// Dev only seeder
router.post('/api/dev/seed', seedData);

module.exports = router;
