const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');
const TransferRequest = require('../models/TransferRequest');
const TransferResponse = require('../models/TransferResponse');
const { haversine } = require('../utils/geo');
const { computeMatchScore } = require('../services/scoringService');

const generateRequestId = () => `REQ${uuidv4().split('-')[0].toUpperCase()}`;

// @desc    Create patient transfer request
// @route   POST /api/transfer/create
// @access  Private
const createTransfer = asyncHandler(async (req, res) => {
    const { patient_name, severity, condition, required_resources, notes, location } = req.body;

    // hospital is attached to req by protect middleware
    const origin = req.hospital;

    const requestId = generateRequestId();
    const transfer = new TransferRequest({
        request_id: requestId,
        origin_hospital_id: origin._id,
        patient_name,
        severity,
        condition,
        required_resources,
        notes,
        location_lat: location ? location.lat : origin.location_lat,
        location_lng: location ? location.lng : origin.location_lng,
        status: 'created'
    });

    await transfer.save();

    res.status(201).json({
        request_id: requestId,
        status: "created",
        message: "Transfer request created successfully"
    });
});

// @desc    Match hospitals for a request
// @route   GET /api/transfer/match/:request_id
// @access  Private
const matchHospitals = asyncHandler(async (req, res) => {
    const transfer = await TransferRequest.findOne({ request_id: req.params.request_id });
    if (!transfer) {
        res.status(404);
        throw new Error("Transfer request not found");
    }

    const hospitals = await Hospital.find({ _id: { $ne: transfer.origin_hospital_id } });
    const reqLat = transfer.location_lat || 0;
    const reqLng = transfer.location_lng || 0;

    const ranked = hospitals.map(h => {
        const dist = haversine(reqLat, reqLng, h.location_lat || 0, h.location_lng || 0);
        const score = computeMatchScore(h, transfer, dist);

        const avail = [];
        if (h.icu_beds > 0) avail.push("ICU");
        if (h.ventilators > 0) avail.push("VENTILATOR");
        if (h.oxygen_units > 0) avail.push("OXYGEN");
        if (h.general_beds > 0) avail.push("GENERAL");

        const required = (transfer.required_resources || []).map(r => r.toUpperCase());
        const specMatch = required.every(r => avail.includes(r));

        const eta = parseFloat((dist / 25 * 60).toFixed(1));

        return {
            hospital_id: h.hospital_id,
            name: h.name,
            score,
            distance_km: dist,
            eta_minutes: eta,
            specialization_match: specMatch,
            available_resources: avail
        };
    });

    ranked.sort((a, b) => b.score - a.score);

    // Update transfer with Top 3 for auto-approval reference
    const top3 = ranked.slice(0, 3).map(h => h.hospital_id);
    transfer.top_3_priority_ids = top3;
    await transfer.save();

    res.json({
        request_id: req.params.request_id,
        ranked_hospitals: ranked,
        top_recommendations: ranked.slice(0, 3)
    });
});

// @desc    Broadcast transfer request to hospitals
// @route   POST /api/transfer/broadcast
// @access  Private
const broadcastTransfer = asyncHandler(async (req, res) => {
    const { request_id, hospital_ids } = req.body;

    const transfer = await TransferRequest.findOne({ request_id });
    if (!transfer) {
        res.status(404);
        throw new Error("Transfer request not found");
    }

    // If no hospital_ids provided, broadcast to all hospitals within 50km
    let targets = hospital_ids;
    if (!targets || targets.length === 0) {
        const reqLat = transfer.location_lat || 0;
        const reqLng = transfer.location_lng || 0;
        const allHospitals = await Hospital.find({ _id: { $ne: transfer.origin_hospital_id } });
        targets = allHospitals
            .filter(h => haversine(reqLat, reqLng, h.location_lat || 0, h.location_lng || 0) < 50)
            .map(h => h.hospital_id);
    }

    // Update status
    transfer.status = "broadcasted";
    transfer.broadcasted_hospitals = targets;
    await transfer.save();

    // Check for auto-accept (general settings)
    for (const hid of targets) {
        const h = await Hospital.findOne({ hospital_id: hid });
        // ... (rest of auto-accept logic remains similar)
        if (h && h.auto_accept_enabled) {
            const conditions = h.auto_accept_conditions || {};
            const severityMatch = !conditions.severity || conditions.severity === transfer.severity;
            
            let resourceMatch = true;
            if (conditions.required_resources) {
                const condRes = conditions.required_resources.map(r => r.toUpperCase());
                const reqRes = (transfer.required_resources || []).map(r => r.toUpperCase());
                resourceMatch = reqRes.some(r => condRes.includes(r));
            }

            if (severityMatch && resourceMatch) {
                const autoResp = new TransferResponse({
                    request_id: transfer._id,
                    hospital_id: hid,
                    action: "accept",
                    is_auto: true
                });
                await autoResp.save();
            }
        }
    }

    res.json({
        status: "broadcasted",
        message: "Request sent to hospitals"
    });
});

// @desc    Get transfer status
// @route   GET /api/transfer/:request_id
// @access  Private
const getTransferStatus = asyncHandler(async (req, res) => {
    const transfer = await TransferRequest.findOne({ request_id: req.params.request_id });
    if (!transfer) {
        res.status(404);
        throw new Error("Transfer request not found");
    }

    const responses = await TransferResponse.find({ request_id: transfer._id });
    const responseEntries = responses.map(r => ({
        hospital_id: r.hospital_id,
        response: r.action
    }));

    let assigned = null;
    if (transfer.assigned_hospital_id) {
        const assignedH = await Hospital.findById(transfer.assigned_hospital_id);
        assigned = assignedH ? assignedH.hospital_id : null;
    }

    res.json({
        request_id: transfer.request_id,
        status: transfer.status,
        assigned_hospital: assigned,
        responses: responseEntries
    });
});

// @desc    Finalize hospital assignment
// @route   POST /api/transfer/finalize
// @access  Private
const finalizeAssignment = asyncHandler(async (req, res) => {
    const { request_id } = req.body;

    const transfer = await TransferRequest.findOne({ request_id });
    if (!transfer) {
        res.status(404);
        throw new Error("Transfer request not found");
    }

    const accepts = await TransferResponse.find({ request_id: transfer._id, action: 'accept' });
    if (accepts.length === 0) {
        res.status(400);
        throw new Error("No hospitals have accepted this request yet");
    }

    const reqLat = transfer.location_lat || 0;
    const reqLng = transfer.location_lng || 0;

    let bestHospital = null;
    let bestScore = -1;
    let bestEta = 0;

    for (const resp of accepts) {
        const h = await Hospital.findOne({ hospital_id: resp.hospital_id });
        if (!h) continue;

        const dist = haversine(reqLat, reqLng, h.location_lat || 0, h.location_lng || 0);
        const score = computeMatchScore(h, transfer, dist);
        const eta = parseFloat((dist / 25 * 60).toFixed(1));

        if (score > bestScore) {
            bestScore = score;
            bestHospital = h;
            bestEta = eta;
        }
    }

    if (!bestHospital) {
        res.status(400);
        throw new Error("Could not determine best hospital");
    }

    transfer.assigned_hospital_id = bestHospital._id;
    transfer.status = 'confirmed';
    await transfer.save();

    res.json({
        assigned_hospital_id: bestHospital.hospital_id,
        eta: bestEta,
        message: "Hospital assigned successfully"
    });
});

// @desc    Get transfer history for the hospital
// @route   GET /api/transfer/history
// @access  Private
const getTransferHistory = asyncHandler(async (req, res) => {
    const hospital = req.hospital;

    // Find transfers where this hospital is the origin OR the assigned destination
    const history = await TransferRequest.find({
        $or: [
            { origin_hospital_id: hospital._id },
            { assigned_hospital_id: hospital._id }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('origin_hospital_id', 'name hospital_id')
    .populate('assigned_hospital_id', 'name hospital_id');

    const entries = history.map(t => ({
        request_id: t.request_id,
        patient_name: t.patient_name,
        severity: t.severity,
        status: t.status,
        date: t.createdAt,
        type: t.origin_hospital_id?._id.toString() === hospital._id.toString() ? 'Outgoing' : 'Incoming',
        partner_node: t.origin_hospital_id?._id.toString() === hospital._id.toString() 
            ? (t.assigned_hospital_id?.name || 'Searching...') 
            : t.origin_hospital_id?.name
    }));

    res.json({ history: entries });
});

module.exports = {
    createTransfer,
    matchHospitals,
    broadcastTransfer,
    getTransferStatus,
    finalizeAssignment,
    getTransferHistory
};
