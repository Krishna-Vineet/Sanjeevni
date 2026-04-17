const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');

/**
 * Generate a JWT token for a hospital.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth hospital & get token
// @route   POST /api/auth/login
// @access  Public
const loginHospital = asyncHandler(async (req, res) => {
    const { hospital_id, password } = req.body;

    const hospital = await Hospital.findOne({ hospital_id });

    if (hospital && (await bcrypt.compare(password, hospital.password))) {
        res.json({
            token: generateToken(hospital.hospital_id),
            hospital: {
                hospital_id: hospital.hospital_id,
                name: hospital.name,
                icu_beds: hospital.icu_beds,
                general_beds: hospital.general_beds,
                oxygen_units: hospital.oxygen_units,
                ventilators: hospital.ventilators,
                trust_score: hospital.trust_score,
                location: { lat: hospital.location_lat, lng: hospital.location_lng }
            },
            message: "Login successful"
        });
    } else {
        res.status(401);
        throw new Error('Invalid hospital ID or password');
    }
});

// @desc    Logout hospital
// @route   POST /api/auth/logout
// @access  Public
const logoutHospital = (req, res) => {
    res.json({ message: "Logged out successfully" });
};

module.exports = { loginHospital, logoutHospital };
