const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');

/**
 * Middleware to protect private routes using JWT.
 * Verifies token and attaches hospital info to the request object.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get hospital from the token (decoded contains the id)
            // We use hospital_id as the primary identifier in the token payload
            req.hospital = await Hospital.findOne({ hospital_id: decoded.id }).select('-password');

            if (!req.hospital) {
                res.status(401);
                throw new Error('Not authorized, hospital not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };
