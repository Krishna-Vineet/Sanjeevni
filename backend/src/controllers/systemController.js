const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');
const HistoricalSurgeData = require('../models/HistoricalSurgeData');
const { haversine } = require('../utils/geo');
const fs = require('fs');
const path = require('path');

// @desc    Fetch hospitals sorted by distance
// @route   GET /api/hospitals/nearby
// @access  Public
const getNearbyHospitals = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        res.status(400);
        throw new Error("Latitude and Longitude are required");
    }

    const hospitals = await Hospital.find();
    const results = hospitals.map(h => ({
        id: h.hospital_id,
        name: h.name,
        distance_km: haversine(parseFloat(lat), parseFloat(lng), h.location_lat || 0, h.location_lng || 0)
    }));

    results.sort((a, b) => a.distance_km - b.distance_km);
    res.json({ hospitals: results });
});

// @desc    Populate real Gurgaon hospitals
// @route   POST /api/dev/seed
// @access  Public (Dev only)
const seedData = asyncHandler(async (req, res) => {
    // Clean start for "Elite" focus
    await Hospital.deleteMany({});
    
    const mockHospitals = [
        { id: process.env.HOSP_MEDANTA_ID, pwd: process.env.HOSP_MEDANTA_PWD, name: "Medanta - The Medicity", lat: 28.4478, lng: 77.0449, spec: "Cardiac, Neuro, Oncology", icu: 150, gen: 1200, oxy: 500, vent: 100, rating: 4.8 },
        { id: process.env.HOSP_FORTIS_ID, pwd: process.env.HOSP_FORTIS_PWD, name: "Fortis Memorial Research Institute", lat: 28.4595, lng: 77.0726, spec: "Neuro, Oncology, Cardiac", icu: 100, gen: 800, oxy: 400, vent: 80, rating: 4.7 },
        { id: process.env.HOSP_ARTEMIS_ID, pwd: process.env.HOSP_ARTEMIS_PWD, name: "Artemis Hospital", lat: 28.4328, lng: 77.0910, spec: "Cardiology, Oncology, Ortho", icu: 80, gen: 600, oxy: 300, vent: 60, rating: 4.6 },
        { id: process.env.HOSP_MAX_ID, pwd: process.env.HOSP_MAX_PWD, name: "Max Super Speciality Hospital", lat: 28.4700, lng: 77.0870, spec: "Cardiac, Oncology, Nephrology", icu: 50, gen: 400, oxy: 200, vent: 40, rating: 4.7 },
        { id: process.env.HOSP_NARAYAN_ID, pwd: process.env.HOSP_NARAYAN_PWD, name: "Narayana Superspeciality Hospital", lat: 28.4782, lng: 77.0892, spec: "Cardiac, Oncology, Neuro", icu: 60, gen: 500, oxy: 250, vent: 50, rating: 4.5 },
        { id: process.env.HOSP_PARAS_ID, pwd: process.env.HOSP_PARAS_PWD, name: "Paras Health", lat: 28.4608, lng: 77.0865, spec: "Gastro, Urology, Neuro", icu: 45, gen: 350, oxy: 180, vent: 35, rating: 4.4 },
        { id: process.env.HOSP_CKBIRLA_ID, pwd: process.env.HOSP_CKBIRLA_PWD, name: "CK Birla Hospital", lat: 28.4310, lng: 77.0850, spec: "Obs & Gynae, Paediatrics", icu: 30, gen: 250, oxy: 120, vent: 25, rating: 4.3 },
        { id: process.env.HOSP_PARK_ID, pwd: process.env.HOSP_PARK_PWD, name: "Park Hospital", lat: 28.4350, lng: 77.0580, spec: "Cardiac, Bariatric, ENT", icu: 40, gen: 300, oxy: 150, vent: 30, rating: 4.2 },
        { id: process.env.HOSP_CLOUDN_ID, pwd: process.env.HOSP_CLOUDN_PWD, name: "Cloudnine Hospital", lat: 28.4358, lng: 77.0620, spec: "Maternity, Neonatal", icu: 20, gen: 150, oxy: 100, vent: 15, rating: 4.5 },
        { id: process.env.HOSP_SIGNAT_ID, pwd: process.env.HOSP_SIGNAT_PWD, name: "Signature Advanced Super Speciality", lat: 28.4110, lng: 76.9740, spec: "Trauma, Cardiac, Neuro", icu: 35, gen: 280, oxy: 140, vent: 28, rating: 4.1 },
    ];

    for (const h of mockHospitals) {
        const hashedPassword = await bcrypt.hash(h.pwd, 10);
        await new Hospital({
            hospital_id: h.id,
            name: h.name,
            location_lat: h.lat,
            location_lng: h.lng,
            specialization: h.spec,
            icu_beds: h.icu,
            general_beds: h.gen,
            oxygen_units: h.oxy,
            ventilators: h.vent,
            rating: h.rating,
            auto_accept_enabled: false,
            password: hashedPassword
        }).save();
    }

    res.json({ 
        status: "seeded", 
        message: `Seeded ${mockHospitals.length} Gurgaon hospitals with fixed credentials from .env.` 
    });
});

module.exports = { getNearbyHospitals, seedData };
