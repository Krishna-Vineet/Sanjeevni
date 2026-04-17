const express = require('express');
const router = express.Router();
const { loginHospital, logoutHospital } = require('../controllers/authController');

// @route   POST /api/auth/login
router.post('/login', loginHospital);

// @route   POST /api/auth/logout
router.post('/logout', logoutHospital);

module.exports = router;
