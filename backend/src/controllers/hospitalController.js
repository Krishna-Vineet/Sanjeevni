const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');
const TransferRequest = require('../models/TransferRequest');
const TransferResponse = require('../models/TransferResponse');

// @desc    Respond to a transfer request
// @route   POST /api/hospital/respond
// @access  Private
const respondToTransfer = asyncHandler(async (req, res) => {
    const { request_id, response } = req.body;
    const hospital_id = req.hospital.hospital_id;

    const transfer = await TransferRequest.findOne({ request_id });
    if (!transfer) {
        res.status(404);
        throw new Error(`Transfer request '${request_id}' not found`);
    }

    const broadcasted = transfer.broadcasted_hospitals || [];
    if (!broadcasted.includes(hospital_id)) {
        res.status(400);
        throw new Error("This hospital was not included in the broadcast");
    }

    const existing = await TransferResponse.findOne({ request_id: transfer._id, hospital_id });
    if (existing) {
        res.status(400);
        throw new Error("Hospital has already responded to this request");
    }

    if (!['accept', 'reject'].includes(response)) {
        res.status(400);
        throw new Error("Response must be 'accept' or 'reject'");
    }

    const resp = new TransferResponse({
        request_id: transfer._id,
        hospital_id,
        action: response,
        is_auto: false
    });
    await resp.save();

    // ELITE FEATURE: Auto-approve if in Top 3 priority
    const top3 = transfer.top_3_priority_ids || [];
    if (response === 'accept' && top3.includes(hospital_id)) {
        transfer.status = 'confirmed';
        transfer.assigned_hospital_id = req.hospital._id;
        await transfer.save();
        return res.json({ 
            status: "confirmed", 
            message: "Response recorded. Request auto-approved as you are a top-priority match!" 
        });
    }

    res.json({ status: "recorded", message: "Response submitted" });
});

// @desc    Get incoming requests for hospital
// @route   GET /api/hospital/requests
// @access  Private
const getIncomingRequests = asyncHandler(async (req, res) => {
    const hospital_id = req.hospital.hospital_id;

    // Find all broadcasted requests where this hospital is included and hasn't responded
    const allTransfers = await TransferRequest.find({
        status: { $in: ['broadcasted', 'created'] }
    });

    const incoming = [];
    for (const t of allTransfers) {
        const broadcasted = t.broadcasted_hospitals || [];
        if (broadcasted.includes(hospital_id)) {
            const existingResp = await TransferResponse.findOne({
                request_id: t._id,
                hospital_id
            });
            if (!existingResp) {
                incoming.push({
                    request_id: t.request_id,
                    severity: t.severity,
                    condition: t.condition,
                    required_resources: t.required_resources || []
                });
            }
        }
    }

    res.json({ requests: incoming });
});

// @desc    Update hospital capacity
// @route   PUT /api/hospital/capacity
// @access  Private
const updateCapacity = asyncHandler(async (req, res) => {
    const hospital = req.hospital;
    const { icu_beds, general_beds, oxygen_units, ventilators } = req.body;

    hospital.icu_beds = icu_beds;
    hospital.general_beds = general_beds;
    hospital.oxygen_units = oxygen_units;
    hospital.ventilators = ventilators;
    await hospital.save();

    res.json({ status: "updated" });
});

// @desc    Update auto-accept settings
// @route   PUT /api/hospital/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
    const hospital = req.hospital;
    const { auto_accept_enabled, conditions } = req.body;

    hospital.auto_accept_enabled = auto_accept_enabled;
    hospital.auto_accept_conditions = conditions || null;
    await hospital.save();

    res.json({ status: "updated" });
});

module.exports = {
    respondToTransfer,
    getIncomingRequests,
    updateCapacity,
    updateSettings
};
